import {
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { COOLDOWN_TICKET_MS } from "../config/constants";
import { User } from "../database/database";

export const ticketCommand = {
  name: "ticket",
  description:
    "Tenta obter um ticket para girar na roleta, com uma chance de 10%",
};

export async function executarTicket(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "Este comando só funciona num servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let utilizador = await User.findOne({
    userId: interaction.user.id,
    guildId,
  });

  if (!utilizador) {
    utilizador = await User.create({
      userId: interaction.user.id,
      guildId,
    });
  }

  const agora = Date.now();
  const ultimaUtilizacao = utilizador.ultimaUtilizacao ?? 0;
  const tempoPassado = agora - ultimaUtilizacao;
  const tempoRestante = COOLDOWN_TICKET_MS - tempoPassado;

  if (tempoRestante > 0) {
    const totalMinutos = Math.ceil(tempoRestante / 60_000);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    await interaction.reply({
      content: `Tens de esperar mais ${horas} hora(s) e ${minutos} minuto(s).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ganhouTicket = Math.random() < 0.1;

  if (ganhouTicket) {
    utilizador.tickets += 1;
  }

  utilizador.ultimaUtilizacao = agora;
  await utilizador.save();

  if (ganhouTicket) {
    await interaction.reply(
      "Acabaste de ganhar um Ticket! Usa este Ticket para girar na roleta.",
    );
  } else {
    await interaction.reply(
      "Não foi desta que conseguiste um Ticket. Talvez consigas na próxima?",
    );
  }
}
