import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

export const helpcommand = {
  name: "help",
  description: "Ajuda a conhecer o bot, Mostra todos os comandos e o que fazem",
};

export async function executarHelp(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Central de Ajuda")
      .setDescription(
        "Consulta abaixo os comandos disponíveis e descobre como utilizar o bot.",
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: "Tickets",
          value:
            "`/ticket` — Tenta obter um ticket com 10% de probabilidade.\n" +
            "`/stock` — Consulta quantos tickets possuis.",
        },
        {
          name: "Roleta",
          value: "`/roleta` — Utiliza um ticket para sortear uma recompensa.",
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
