import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { User } from "../database/database";

export const stockCommand = {
  name: "stock",
  description: "Ver quantos Tickets o membro possui",
  options: [
    {
      type: 6,
      name: "utilizador",
      description: "Utilizador para saber o stock",
      required: false,
    },
  ],
};

export async function executarStock(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const guildId = interaction.guildId;
  const utilizadorEscolhido = interaction.options.getUser("utilizador");
  const alvo = utilizadorEscolhido ?? interaction.user;
  if (!guildId) {
    await interaction.reply({
      content: "Este comando só funciona num servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const utilizador = await User.findOne({
    userId: alvo.id,
    guildId,
  });
  if(utilizadorEscolhido === null){
    await interaction.reply({
      content: `Tens ${utilizador?.tickets ?? 0} tickets!`,
      flags: MessageFlags.Ephemeral,
    });
    return
  }
  await interaction.reply({
    content: `${alvo} possui  ${utilizador?.tickets} para girar na roleta.`,
    flags: MessageFlags.Ephemeral,
  });
}
