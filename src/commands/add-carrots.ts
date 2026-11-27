import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { canalPlantacao } from '../buttons/plantacao';
import { adicionarCenouras } from '../db/colheitas';

const cargoAutorizado = '1542627361550508132';

export const comandoAdicionarCenouras = new SlashCommandBuilder()
  .setName('add-carrots')
  .setDescription('Adiciona cenouras ao saldo de um membro.')
  .addUserOption(opcao => opcao.setName('pessoa').setDescription('Membro que recebe as cenouras.').setRequired(true))
  .addIntegerOption(opcao => opcao.setName('quantidade').setDescription('Número de cenouras a adicionar.')
    .setMinValue(1).setMaxValue(Number.MAX_SAFE_INTEGER).setRequired(true));

export async function executarAdicionarCenouras(interacao: ChatInputCommandInteraction) {
  if (!interacao.inCachedGuild() || !interacao.member.roles.cache.has(cargoAutorizado)) {
    await interacao.reply({ content: 'Só podes usar este comando se tiveres o cargo autorizado.', flags: MessageFlags.Ephemeral });
    return;
  }

  const pessoa = interacao.options.getMember('pessoa');
  if (!pessoa) {
    await interacao.reply({ content: 'Escolhe um membro deste servidor.', flags: MessageFlags.Ephemeral });
    return;
  }

  const quantidade = interacao.options.getInteger('quantidade', true);
  if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
    await interacao.reply({ content: 'A quantidade tem de ser um número inteiro positivo.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interacao.deferReply({ flags: MessageFlags.Ephemeral });
  let creditada: boolean;
  try {
    creditada = await adicionarCenouras(canalPlantacao, pessoa.id, quantidade);
  } catch (erro) {
    console.error('Falha ao adicionar cenouras.', erro);
    await interacao.editReply('Não consegui adicionar as cenouras.');
    return;
  }

  await interacao.editReply({
    content: creditada
      ? `Adicionaste **${quantidade} cenouras** a <@${pessoa.id}>. 🥕`
      : 'Esta quantidade ultrapassa o limite de cenouras do membro.',
    allowedMentions: { parse: [] },
  });
}
