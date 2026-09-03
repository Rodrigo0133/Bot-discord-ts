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
        value:
          "`38%` — **5 000 moedas**\n" +
          "`20%` — **10 000 moedas**\n" +
          "`14%` — **+1 cargo de nível**\n" +
          "`10%` — <@&1290704724110348299>\n" +
          "`7%` — **VIP aleatório**\n" +
          "`5%` — **Cargo exclusivo aleatório**\n" +
          "`3%` — <@&1416440917803536505>\n" +
          "`2%` — **100 000 moedas**\n" +
          "`1%` — <@&1541241011752402954>\n" +
          "`0.004%` — <@&1541241672212553779>\n",
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
