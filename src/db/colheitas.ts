import { model, Schema } from 'mongoose';

const compraCargo = new Schema({
  id: { type: String, required: true },
  emEntrega: { type: Boolean, required: true },
}, { _id: false });

const Plantacao = model('PlantacaoNatal', new Schema({
  _id: { type: String, required: true },
  aberta: String,
  recolheram: [String],
  saldos: { type: Map, of: Number },
  totalGanho: { type: Map, of: Number },
  comprasCargos: { type: Map, of: compraCargo },
}));

function calcularCredito(membro: string, quantidade: number) {
  const saldo = `saldos.${membro}`;
  const total = `totalGanho.${membro}`;
  const saldoAnterior = { $ifNull: [`$${saldo}`, 0] };
  // Nos registos antigos, o saldo também representava o total ganho.
  const ganhoAnterior = { $ifNull: [`$${total}`, saldoAnterior] };
  const campos = {
    [saldo]: { $add: [saldoAnterior, quantidade] },
    [total]: { $add: [ganhoAnterior, quantidade] },
  };
  const dentroDoLimite = {
    $and: Object.values(campos).map(valor => ({ $lte: [valor, Number.MAX_SAFE_INTEGER] })),
  };
  return { campos, dentroDoLimite };
}

export async function adicionarCenouras(canal: string, membro: string, quantidade: number) {
  const { campos, dentroDoLimite } = calcularCredito(membro, quantidade);
  const resultado = await Plantacao.updateOne({ _id: canal, $expr: dentroDoLimite },
    [{ $set: campos }], { updatePipeline: true });
  return resultado.modifiedCount === 1;
}

export function abrirColheitas(canal: string) {
  return {
    async abrir(mensagem: string) {
      const anterior = await Plantacao.findOneAndUpdate(
        { _id: canal }, { $set: { aberta: mensagem, recolheram: [] } },
        { upsert: true, returnDocument: 'before', projection: { aberta: 1 } },
      ).lean();
      return anterior?.aberta;
    },

    async colher(mensagem: string, membro: string, cenouras: number) {
      // Registar o participante e creditar o saldo são uma única escrita no MongoDB.
      const colheita = { _id: canal, aberta: mensagem };
      const { campos, dentroDoLimite } = calcularCredito(membro, cenouras);
      const resultado = await Plantacao.updateOne({ ...colheita, recolheram: { $ne: membro }, $expr: dentroDoLimite }, [
        { $set: {
          ...campos,
          recolheram: { $concatArrays: [{ $ifNull: ['$recolheram', []] }, [membro]] },
        } },
      ], { updatePipeline: true });
      if (resultado.modifiedCount === 1) return 'creditada';
      const atual = await Plantacao.findOne(colheita, { recolheram: 1 }).lean();
      if (!atual) return 'encerrada';
      return atual.recolheram?.includes(membro) ? 'repetida' : 'limite';
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

export function abrirCompraCargo(canal: string, membro: string, artigo: string, preco: number) {
  const chave = `${membro}:${artigo}`;
  const compra = `comprasCargos.${chave}`;
  const saldo = `saldos.${membro}`;
  const total = `totalGanho.${membro}`;

  return {
    async consultar() {
      const plantacao = await Plantacao.findById(canal, { [compra]: 1 });
      return plantacao?.comprasCargos?.get(chave);
    },

    async reservar(id: string) {
      const resultado = await Plantacao.updateOne(
        { _id: canal, [saldo]: { $gte: preco }, [compra]: { $exists: false } },
        [{ $set: {
          [saldo]: { $subtract: [`$${saldo}`, preco] },
          [total]: { $ifNull: [`$${total}`, `$${saldo}`] },
          [compra]: { id, emEntrega: false },
        } }],
        { updatePipeline: true },
      );
      return resultado.modifiedCount === 1;
    },

    async cancelar(id: string) {
      const resultado = await Plantacao.updateOne(
        { _id: canal, [`${compra}.id`]: id, [`${compra}.emEntrega`]: false },
        { $inc: { [saldo]: preco }, $unset: { [compra]: 1 } },
      );
      return resultado.modifiedCount === 1;
    },

    async iniciarEntrega(id: string) {
      const resultado = await Plantacao.updateOne(
        { _id: canal, [`${compra}.id`]: id, [`${compra}.emEntrega`]: false },
        { $set: { [`${compra}.emEntrega`]: true } },
      );
      return resultado.modifiedCount === 1;
    },

    async concluir(id: string) {
      await Plantacao.updateOne({ _id: canal, [`${compra}.id`]: id }, { $unset: { [compra]: 1 } });
    },
  };
}
