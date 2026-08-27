import {
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { CARGO_ADICIONAR_TICKETS_ID, CARGO_ADICIONAR_TICKETS_ID2 } from "../config/constants";
import { User } from "../database/database";

export const addCommand = {
  name: "add",
  description: "Adiciona recursos a um utilizador",
  options: [
    {
      type: 1,
      name: "ticket",
      description: "Adiciona tickets a um utilizador",
      options: [
        {
          type: 4,
          name: "quantidade",
          description: "Quantidade de tickets",
          required: true,
          min_value: 1,
        },
        {
          type: 6,
          name: "utilizador",
          description: "Utilizador que receberá os tickets",
          required: true,
        },
      ],
    },
  ],
};

export async function executarAddTicket(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const subcomando = interaction.options.getSubcommand();

  if (subcomando !== "ticket") return;

  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Este comando só funciona num servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (
    !interaction.member.roles.cache.has(CARGO_ADICIONAR_TICKETS_ID) &&
    !interaction.member.roles.cache.has(CARGO_ADICIONAR_TICKETS_ID2)
  ) {
    await interaction.reply({
      content: "Não tens o cargo necessário para adicionar tickets.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const quantidade = interaction.options.getInteger("quantidade", true);
  const utilizadorEscolhido = interaction.options.getUser("utilizador", true);

  let utilizador = await User.findOne({
    userId: utilizadorEscolhido.id,
    guildId: interaction.guildId,
  });

  if (!utilizador) {
    utilizador = await User.create({
      userId: utilizadorEscolhido.id,
      guildId: interaction.guildId,
    });
  }

  utilizador.tickets += quantidade;
  await utilizador.save();

  await interaction.reply(
    `Adicionaste ${quantidade} ticket(s) a ${utilizadorEscolhido}. Agora tem ${utilizador.tickets}.`,
  );
}
