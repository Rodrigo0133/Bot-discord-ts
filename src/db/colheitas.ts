import { model, Schema } from 'mongoose';

const premio = new Schema({
  mensagem: { type: String, required: true },
  membro: { type: String, required: true },
  cenouras: { type: Number, required: true },
}, { _id: false });

const Plantacao = model('PlantacaoNatal', new Schema({
  _id: { type: String, required: true },
  aberta: String,
  saldos: { type: Map, of: Number },
  totalGanho: { type: Map, of: Number },
  pendentes: [premio],
}));

export function abrirColheitas(canal: string) {
  return {
    async abrir(mensagem: string) {
      const anterior = await Plantacao.findOneAndUpdate(
        { _id: canal }, { $set: { aberta: mensagem } },
        { upsert: true, returnDocument: 'before', projection: { aberta: 1 } },
      ).lean();
      return anterior?.aberta;
    },

    async colher(mensagem: string, membro: string, cenouras: number) {
      // Reservar a colheita e creditar o saldo são uma única escrita no MongoDB.
      const saldo = `saldos.${membro}`;
      const total = `totalGanho.${membro}`;
      // Antes da loja, todo o saldo existente vinha de ganhos da plantação.
      const saldoAnterior = { $ifNull: [`$${saldo}`, 0] };
      const ganhoAnterior = { $ifNull: [`$${total}`, saldoAnterior] };
      const resultado = await Plantacao.updateOne({ _id: canal, aberta: mensagem }, [
        { $set: {
          [saldo]: { $add: [saldoAnterior, cenouras] },
          [total]: { $add: [ganhoAnterior, cenouras] },
          pendentes: { $concatArrays: [{ $ifNull: ['$pendentes', []] }, [{ mensagem, membro, cenouras }]] },
        } },
        { $unset: 'aberta' },
      ], { updatePipeline: true });
      return resultado.modifiedCount === 1;
    },

    async pendentes() {
      const plantacao = await Plantacao.findById(canal, { pendentes: 1 }).lean();
      return plantacao?.pendentes ?? [];
    },

    async marcarAnunciada(mensagem: string) {
      await Plantacao.updateOne({ _id: canal }, { $pull: { pendentes: { mensagem } } });
    },
  };
}

export async function consultarSaldos(canal: string) {
  const plantacao = await Plantacao.findById(canal, { saldos: 1, totalGanho: 1 });
  return {
    saldos: plantacao?.saldos ?? new Map<string, number>(),
    totais: plantacao?.totalGanho ?? new Map<string, number>(),
  };
}
