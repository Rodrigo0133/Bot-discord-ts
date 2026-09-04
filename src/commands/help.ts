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
          name: "Geral",
          value:
            "`/help` — Mostra os comandos disponíveis e o que fazem.",
        },
        {
          name: "Tickets",
          value:
            "`/ticket` — Tenta obter um ticket com 10% de probabilidade.\n" +
            "`/stock [utilizador]` — Consulta os teus tickets ou os de outro utilizador.",
        },
        {
          name: "Roleta",
          value: "`/roleta` — Utiliza um ticket para sortear uma recompensa.\n" +
          "`/pity` — Consulta o teu contador de Pity.",
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
