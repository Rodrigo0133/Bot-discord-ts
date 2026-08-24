import type { ChatInputCommandInteraction } from "discord.js";

export const olaCommand = {
  name: "ola",
  description: "O bot responde com uma saudação",
};

export async function executarOla(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.reply("Olá! O bot está a funcionar.");
}
