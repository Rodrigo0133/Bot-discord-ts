import { randomInt } from 'node:crypto';
import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags,
  type ButtonInteraction, type Client, type TextChannel,
} from 'discord.js';
import { abrirColheitas } from '../db/colheitas';
import { cargoParticipante } from './entrar';

export const canalPlantacao = '1569124521917685781';
export const botaoColher = 'lcnxmas26:colher';

export function criarPlantacao() {
  const colheitas = abrirColheitas(canalPlantacao);

  async function publicar(canal: TextChannel) {
    const botao = new ButtonBuilder().setCustomId(botaoColher).setLabel('Colher')
      .setEmoji({ name: '🥕' }).setStyle(ButtonStyle.Success);
    const mensagem = await canal.send({
      embeds: [{ title: 'Hora da Colheita!', description: 'Cada participante pode colher uma vez nesta mensagem.', color: 0xf28c28 }],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(botao)],
    });
    const anterior = await colheitas.abrir(mensagem.id);
    if (anterior) {
      await canal.messages.edit(anterior, { content: 'Esta colheita terminou.', embeds: [], components: [] })
        .catch(erro => console.error('Não foi possível atualizar a colheita anterior.', erro.message));
    }
  }

  function agendar(canal: TextChannel) {
    const intervalo = randomInt(30 * 60_000, 180 * 60_000 + 1);
    setTimeout(async () => {
      try {
        await publicar(canal);
      } catch (erro) {
        console.error('Falha ao publicar a colheita.', erro);
      } finally {
        agendar(canal);
      }
    }, intervalo);
  }

  async function iniciar(cliente: Client<true>) {
    const canal = await cliente.channels.fetch(canalPlantacao);
    if (canal?.type !== ChannelType.GuildText) throw new Error('Canal da plantação indisponível.');
    await publicar(canal);
    agendar(canal);
  }

  async function colher(interacao: ButtonInteraction) {
    if (!interacao.inCachedGuild() || interacao.channel?.type !== ChannelType.GuildText ||
        !interacao.member.roles.cache.has(cargoParticipante)) {
      await interacao.reply({ content: 'Entra no evento antes de colher.', flags: MessageFlags.Ephemeral });
      return;
    }
    await interacao.deferReply({ flags: MessageFlags.Ephemeral });
    const cenouras = randomInt(100, 1001);
    const resultado = await colheitas.colher(interacao.message.id, interacao.user.id, cenouras);
    const respostas = {
      creditada: `Colheste **${cenouras} cenouras**! 🥕`,
      repetida: 'Já colheste nesta colheita.',
      encerrada: 'Esta colheita já terminou.',
      limite: 'Esta colheita ultrapassaria o teu limite de cenouras.',
    };
    await interacao.editReply(respostas[resultado]);
  }

  return { iniciar, colher };
}
