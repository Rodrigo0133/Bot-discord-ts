import { randomInt } from 'node:crypto';
import { setTimeout as esperar } from 'node:timers/promises';
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

  async function anunciar(canal: TextChannel, mensagem: string, membro: string, cenouras: number) {
    await canal.messages.edit(mensagem, {
      content: `Muito bem <@${membro}>, acabaste de colher **${cenouras} cenouras**! 🥕`,
      embeds: [], components: [], allowedMentions: { parse: [] },
    });
    await colheitas.marcarAnunciada(mensagem);
  }

  async function publicar(canal: TextChannel) {
    const botao = new ButtonBuilder().setCustomId(botaoColher).setLabel('Colher')
      .setEmoji({ name: '🥕' }).setStyle(ButtonStyle.Success);
    const mensagem = await canal.send({
      embeds: [{ title: 'Hora da Colheita!', description: 'Clica no botão para colher algumas cenouras.', color: 0xf28c28 }],
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
    for (const { mensagem, membro, cenouras } of await colheitas.pendentes()) {
      await anunciar(canal, mensagem, membro, cenouras)
        .catch(erro => console.error('Falha ao recuperar o anúncio da colheita.', erro.message));
    }
  }

  async function colher(interacao: ButtonInteraction) {
    if (!interacao.inCachedGuild() || interacao.channel?.type !== ChannelType.GuildText ||
        !interacao.member.roles.cache.has(cargoParticipante)) {
      await interacao.reply({ content: 'Entra no evento antes de colher.', flags: MessageFlags.Ephemeral });
      return;
    }
    const mensagem = interacao.message.id;
    const membro = interacao.user.id;
    const cenouras = randomInt(100, 1001);
    await interacao.deferUpdate();
    if (!await colheitas.colher(mensagem, membro, cenouras)) {
      await interacao.followUp({ content: 'Esta colheita já terminou.', flags: MessageFlags.Ephemeral });
      return;
    }
    await interacao.editReply({ content: 'Colhendo as cenouras…', embeds: [], components: [] })
      .catch(erro => console.error('Falha ao mostrar a colheita em curso.', erro.message));
    await esperar(10_000);
    await anunciar(interacao.channel, mensagem, membro, cenouras);
  }

  return { iniciar, colher };
}
