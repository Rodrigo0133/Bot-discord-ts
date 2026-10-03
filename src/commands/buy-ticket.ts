import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { User } from "../database/database";
import { PERCENTAGEM_AUMENTADA } from "../config/constants";

const { Client: UnbelievaClient } = require("unb-api");

const token = process.env.UNB_API_TOKEN;

if (!token) {
  throw new Error("Falta UNB_API_TOKEN no .env");
}
const comprasEmCurso = new Set<string>();
class UtilizadorNaoEncontradoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UtilizadorNaoEncontradoError";
  }
}
const unb = new UnbelievaClient(token);

export const buyTicketCommand = {
  name: "buy-ticket",
  description: "Compra tickets para um utilizador",
  options: [
    {
      type: 1,
      name: "ticket",
      description: "Compra tickets para um utilizador",
      options: [
        {
          type: 4,
          name: "quantidade",
          description: "Quantidade de tickets",
          required: false,
          min_value: 1,
        },
      ],
    },
  ],
};
export async function executarBuyTicket(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "Este comando só pode ser usado em servidores.",
      ephemeral: true,
    });
    return;
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let quantidade = interaction.options.getInteger("quantidade", false);
  const guildId = interaction.guildId;
  if (!quantidade) {
    quantidade = 1;
  }
  const chave = `${guildId}:${interaction.user.id}`;
  if (comprasEmCurso.has(chave)) {
    await interaction.editReply({
      content: "Já tens uma compra em curso.",
    });
    return;
  }
  comprasEmCurso.add(chave);
  const utilizador = interaction.user;

  let user;
  user = await User.findOne({
    userId: utilizador.id,
    guildId: guildId ?? undefined,
  });
  if (!user) {
    user = await User.create({
      userId: interaction.user.id,
      guildId: guildId ?? undefined,
    });
  }

  try {
    const compradoAntes = user.totalticketscomprado ?? 0;
    const total = Math.round(
      20000 *
        (quantidade +
          PERCENTAGEM_AUMENTADA *
            (quantidade * compradoAntes + (quantidade * (quantidade - 1)) / 2)),
    );
    const saldo = await unb.getUserBalance(
      interaction.guildId,
      interaction.user.id,
    );
    if (saldo.cash < total) {
      throw new UtilizadorNaoEncontradoError("Utilizador não encontrado");
    }
    await unb.editUserBalance(
      interaction.guildId,
      interaction.user.id,
      { cash: total * -1 },
      "tickets",
    );

    user.totalticketscomprado += quantidade;
    user.tickets += quantidade;

    await user.save();
    await interaction.editReply({
      content: `Compraste ${quantidade} tickets para ${utilizador.username} por ${total} moedas.`,
    });
  } catch (error) {
    if (error instanceof UtilizadorNaoEncontradoError) {
      await interaction.editReply({
        content: "Não tens saldo suficiente para comprar os tickets.",
      });
    } else {
      console.error("Erro ao comprar tickets:", error);
      await interaction.editReply({
        content: "Ocorreu um erro ao comprar os tickets.",
      });
    }
    return;
  }finally {
    comprasEmCurso.delete(chave);
  }
}
