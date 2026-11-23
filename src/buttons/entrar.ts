import { MessageFlags, type ButtonInteraction } from 'discord.js';

export const cargoParticipante = '1564057294696616117';

export async function entrar(interacao: ButtonInteraction) {
  await interacao.deferReply({ flags: MessageFlags.Ephemeral });
  let resposta: string;
  try {
    if (!interacao.inCachedGuild()) throw new Error('Servidor do painel indisponível.');
    const membro = interacao.member;
    if (membro.roles.cache.has(cargoParticipante)) {
      resposta = 'Já estás a participar no evento LCNXMAS.';
    } else {
      await membro.roles.add(cargoParticipante);
      resposta = 'Estás oficialmente a participar do evento LCNXMAS.';
    }
  } catch (erro) {
    console.error('Falha ao atribuir o cargo de participante.', erro instanceof Error ? erro.message : erro);
    resposta = 'Não consegui atribuir-te o cargo de participante. Avisa a equipa do servidor.';
  }
  await interacao.editReply(resposta);
}
