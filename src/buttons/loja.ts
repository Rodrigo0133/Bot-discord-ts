import { ButtonStyle, ContainerBuilder, MessageFlags, type ButtonInteraction } from 'discord.js';

const cenoura = { id: '1566110505452703794', name: 'Cenoura_26' };
const artigos = [
  {
    id: 'natal-antigos', titulo: 'Cargos de Natal antigos', preco: 3000,
    descricao: 'Recebe os cargos <@&1057422729768341698>, <@&1185758880190443631>, <@&1312456647913766954> e <@&1440490867281494187>.',
  },
  {
    id: 'level', titulo: '⬆️ Cargos de Level', preco: 3000,
    descricao: 'Recebe todos os cargos de Level, exceto <@&1542896491457417367>.',
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
    id: 'natal-26', titulo: 'Cargo <@&1574534655322095616>', preco: 25000,
    descricao: 'Recebe o novo cargo de Natal <@&1574534655322095616>.',
  },
  {
    id: 'pet-escolha', titulo: 'Pet à escolha', preco: 30000,
    descricao: 'Escolhe qualquer pet, independentemente da raridade.',
  },
];

export async function verLoja(interacao: ButtonInteraction) {
  const caixa = new ContainerBuilder().setAccentColor(0xad6f40)
    .addTextDisplayComponents(texto => texto.setContent('# Loja de Natal\nCompras em preparação.'));

  for (const artigo of artigos) {
    caixa.addSeparatorComponents(separador => separador);
    caixa.addSectionComponents(secao => secao
      .addTextDisplayComponents(texto => texto.setContent(`**${artigo.titulo}**\n${artigo.descricao}`))
      .setButtonAccessory(botao => botao
        .setCustomId(`lcnxmas26:loja:${artigo.id}`)
        .setStyle(ButtonStyle.Success)
        .setEmoji(cenoura)
        .setLabel(String(artigo.preco).replace(/(\d)(\d{3})$/, '$1.$2'))
        .setDisabled(true)));
  }

  await interacao.reply({
    components: [caixa],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
}
