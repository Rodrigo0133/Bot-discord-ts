import {
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { User } from "../database/database";

export const stockCommand = {
  name: "stock",
  description: "Ver quantos Tickets o membro possui",
};

export async function executarStock(
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

  const utilizador = await User.findOne({
    userId: interaction.user.id,
    guildId,
  });

  await interaction.reply({
    content: `Tens ${utilizador?.tickets ?? 0} tickets!`,
    flags: MessageFlags.Ephemeral,
  });
}
