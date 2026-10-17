import { premios } from "../config/premios-roleta";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

export const recompensascommand = {
  name: "recompensas",
  description: "Mostra todas as recompensas disponíveis e o que fazem",
};

export async function executarRecompensas(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Central de Ajuda")
    .setDescription(
      "Consulta abaixo as recompensas disponíveis no bot e descobre como utilizar a /roleta.",
    )
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .addFields(
      {
        name: "Roleta",
        value: "`/roleta` — Utiliza um ticket para sortear uma recompensa.",
      },
      {
        name: "Recompensas",
        value: premios.map((premio) =>
          `\`${premio.peso / 1000}%\` — ${premio.cargo_id ? `<@&${premio.cargo_id}>` : `**${premio.nome}**`}`,
        ).join("\n"),
      },
    )
    .setFooter({
      text: `Pedido por ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();
  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
