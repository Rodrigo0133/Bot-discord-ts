import { verColecao } from './colecao';
import { entrar } from './entrar';
import { verLoja } from './loja';
import { ButtonStyle, MessageFlags, type ButtonInteraction } from 'discord.js';

export const opcoes = [
  { id: 'entrar', titulo: 'Participar', icone: '🗓️', descricao: 'Participa oficialmente no evento de Natal.', botao: 'Entrar', emoji: '🎄', estilo: ButtonStyle.Success },
  { id: 'plantacao', titulo: 'Plantação', icone: '🥕', descricao: 'Visita a plantação e faz colheitas para conseguir cenouras.', botao: 'Ir!', emoji: '🥕', estilo: ButtonStyle.Danger },
  { id: 'colecao', titulo: 'Coleção', icone: '🧰', descricao: 'Vê quantas cenouras tens guardadas, os teus boosts e a tua posição no ranking.', botao: 'Ver!', emoji: '🔎', estilo: ButtonStyle.Danger },
  { id: 'loja', titulo: 'Loja', icone: '🏪', descricao: 'Troca cenouras por recursos, incluindo o cargo @LCN | Xmas26.', botao: 'Ver!', emoji: '🛒', estilo: ButtonStyle.Danger },
  { id: 'rena', titulo: 'Rena', icone: '🦌', descricao: 'Alimenta a rena da LCN com cenouras. Quem lhe der mais comida ganha recompensas, incluindo o cargo @LCN | Xmas26.', botao: 'Alimentar', emoji: '🥕', estilo: ButtonStyle.Success },
  { id: 'carta', titulo: 'Querido Pai Natal…', icone: '💌', descricao: 'Escreve uma única carta ao Pai Natal e escolhe uma prenda para receber no Natal.', botao: 'Escrever', emoji: '✏️', estilo: ButtonStyle.Danger },
  { id: 'missoes', titulo: 'Missões Diárias', icone: '🎁', descricao: 'Completa as missões diárias para ganhar mais cenouras.', botao: 'Ver!', emoji: '⭐', estilo: ButtonStyle.Danger },
  { id: 'converter', titulo: 'Converter Moedas', icone: '🪙', descricao: 'Converte moedas em cenouras, até um máximo de 1000 cenouras por dia.', botao: 'Converter', emoji: '🔄', estilo: ButtonStyle.Success },
];

export function idBotao(id: string) {
  return `lcnxmas26:${id}`;
}

export async function responderAoBotao(interacao: ButtonInteraction) {
  if (interacao.customId === idBotao('entrar')) {
    await entrar(interacao);
    return;
  }

  if (interacao.customId === idBotao('colecao')) {
    await verColecao(interacao);
    return;
  }

  if (interacao.customId === idBotao('loja')) {
    await verLoja(interacao);
    return;
  }

  const opcao = opcoes.find(item => idBotao(item.id) === interacao.customId);
  if (opcao) {
    await interacao.reply({
      content: `**${opcao.titulo}** · Botão recebido. O painel está em teste.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
