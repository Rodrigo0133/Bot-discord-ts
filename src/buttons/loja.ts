import { ButtonStyle, ContainerBuilder, MessageFlags, type ButtonInteraction } from 'discord.js';
import { abrirCompraCargo } from '../db/colheitas';
import { cargoParticipante } from './entrar';
import { canalPlantacao } from './plantacao';

const cenoura = { id: '1566110505452703794', name: 'Cenoura_26' };
const prefixoCompra = 'lcnxmas26:loja:';
const cargosAntigos = ['1057422729768341698', '1185758880190443631', '1312456647913766954', '1440490867281494187'];
const cargoXmas26 = '1574534655322095616';

// Cargos de Level da roleta da branch main, por ordem de nível.
const cargosLevel = [
  '1036689084434874460', // 1
  '1036689239137591338', // 2
  '1036689359384096859', // 3
  '1054135107855843369', // 4
  '1036689735269236807', // 5
  '1036689865733066883', // 10
  '1036689926604980334', // 15
  '1036690352167473303', // 20
  '1036690495964971119', // 30
  '1036690587967033468', // 40
  '1095769327506030644', // 50
  '1095769610663501854', // 60
  '1095770344285020241', // 70
  '1095770612171014265', // 80
  '1095772878668058755', // 90
  '1095773119416914101', // 100
  '1202733155451150468', // 200
  '1292081351154991174', // 300
  '1354531408194048108', // 400
  '1396186073960288379', // 500
];

const artigos: { id: string; titulo: string; preco: number; descricao: string; cargos?: string[] }[] = [
  {
    id: 'natal-antigos', titulo: 'Cargos de Natal antigos', preco: 3000,
    descricao: `Recebe os cargos ${new Intl.ListFormat('pt-PT').format(cargosAntigos.map(id => `<@&${id}>`))}.`,
    cargos: cargosAntigos,
  },
  {
    id: 'level', titulo: '⬆️ Cargos de Level', preco: 3000,
    descricao: 'Recebe os 20 cargos de Level da roleta, do Level 1 ao Level 500. O <@&1542896491457417367> fica de fora.',
    cargos: cargosLevel,
  },
  {
    id: 'boost-cenouras', titulo: 'Boost de cenouras', preco: 10000,
    descricao: 'Acrescenta 20% de cenouras às tuas colheitas por boost comprado.',
  },
  {
    id: 'boost-conversao', titulo: 'Boost de conversão', preco: 10000,
    descricao: 'Aumenta o limite diário de conversão em 500 cenouras por boost comprado.',
  },
  {
    id: 'pet-level', titulo: 'Pet no nível máximo', preco: 15000,
    descricao: 'Escolhe um dos teus pets para subir ao nível 10.',
  },
  {
    id: 'natal-26', titulo: `Cargo <@&${cargoXmas26}>`, preco: 25000,
    descricao: `Recebe o novo cargo de Natal <@&${cargoXmas26}>.`,
    cargos: [cargoXmas26],
  },
  {
    id: 'pet-escolha', titulo: 'Pet à escolha', preco: 30000,
    descricao: 'Escolhe qualquer pet, independentemente da raridade.',
  },
];

export async function verLoja(interacao: ButtonInteraction) {
  const caixa = new ContainerBuilder().setAccentColor(0xad6f40)
    .addTextDisplayComponents(texto => texto.setContent('# Loja de Natal'));

  for (const artigo of artigos) {
    caixa.addSeparatorComponents(separador => separador);
    caixa.addSectionComponents(secao => secao
      .addTextDisplayComponents(texto => texto.setContent(`**${artigo.titulo}**\n${artigo.descricao}`))
      .setButtonAccessory(botao => botao
        .setCustomId(`${prefixoCompra}${artigo.id}`)
        .setStyle(ButtonStyle.Success)
        .setEmoji(cenoura)
        .setLabel(String(artigo.preco).replace(/(\d)(\d{3})$/, '$1.$2'))
        .setDisabled(!artigo.cargos)));
  }

  await interacao.reply({
    components: [caixa],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
}

export async function comprarNaLoja(interacao: ButtonInteraction) {
  const artigo = artigos.find(item => `${prefixoCompra}${item.id}` === interacao.customId);
  if (!artigo?.cargos) return;
  const cargos = artigo.cargos;
  if (!interacao.inCachedGuild() || !interacao.member.roles.cache.has(cargoParticipante)) {
    await interacao.reply({ content: 'Entra no evento antes de comprares na loja.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interacao.deferReply({ flags: MessageFlags.Ephemeral });
  const buscarMembro = () => interacao.guild.members.fetch({ user: interacao.user.id, force: true });
  const compra = abrirCompraCargo(canalPlantacao, interacao.user.id, artigo.id, artigo.preco);
  const jaTemCargo = 'Já tens um dos cargos deste artigo. A compra foi recusada sem cobrar cenouras.';
  let reserva;
  try {
    let membro = await buscarMembro();
    reserva = await compra.consultar();
    if (!reserva && cargos.some(cargo => membro.roles.cache.has(cargo))) {
      await interacao.editReply(jaTemCargo);
      return;
    }

    const cargosServidor = await interacao.guild.roles.fetch();
    if (cargos.some(cargo => !cargosServidor.get(cargo)?.editable && !membro.roles.cache.has(cargo))) {
      await interacao.editReply('O bot não consegue entregar todos os cargos deste artigo. Avisa a equipa do servidor.');
      return;
    }

    if (!reserva) {
      if (!await compra.reservar(interacao.id)) {
        await interacao.editReply(await compra.consultar()
          ? 'Já há uma compra deste artigo em curso. Tenta novamente daqui a pouco.'
          : 'Não tens cenouras suficientes para este artigo.');
        return;
      }
      reserva = { id: interacao.id, emEntrega: false };
    }

    if (!reserva.emEntrega) {
      membro = await buscarMembro();
      if (cargos.some(cargo => membro.roles.cache.has(cargo))) {
        const cancelada = await compra.cancelar(reserva.id);
        await interacao.editReply(cancelada ? jaTemCargo : 'Esta compra já está a ser tratada.');
        return;
      }
      if (!await compra.iniciarEntrega(reserva.id)) {
        await interacao.editReply('Esta compra já está a ser tratada.');
        return;
      }
    }

    for (const cargo of cargos) {
      if (!membro.roles.cache.has(cargo)) await membro.roles.add(cargo);
    }
    await compra.concluir(reserva.id);
  } catch (erro) {
    console.error('Falha na compra de cargos.', erro);
    await interacao.editReply('Não foi possível concluir a compra. Volta a clicar no artigo para retomar qualquer entrega pendente.');
    return;
  }

  await interacao.editReply('Compra concluída. Recebeste os cargos do artigo.');
}
