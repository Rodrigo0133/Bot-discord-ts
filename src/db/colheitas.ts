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
      const resultado = await Plantacao.updateOne({ _id: canal, aberta: mensagem }, {
        $unset: { aberta: 1 },
        $inc: { [`saldos.${membro}`]: cenouras },
        $push: { pendentes: { mensagem, membro, cenouras } },
      });
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
