import { ChatInputCommandInteraction } from "discord.js";
import { User } from "../database/database";
import { PERCENTAGEM_AUMENTADA } from "../config/constants";
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
export async function executarBuyTicket(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  let quantidade = interaction.options.getInteger("quantidade", false);
  let utilizador = interaction.options.getUser("utilizador", false);
    const guildId = interaction.guildId;
  if (!quantidade || !utilizador) {
    quantidade = 1;
    utilizador = interaction.user;
    let user
     user = await User.findOne({
      userId: utilizador.id,
      guildId: guildId ?? undefined,
    });
    if(!user){
      user = await User.create({
        userId: interaction.user.id,
        guildId: guildId ?? undefined,
      });
    }
    let total = 20000;
    for(let i = 0; i < quantidade; i++){
      PERCENTAGEM_AUMENTADA * user.totalticketscomprado
      total = total * PERCENTAGEM_AUMENTADA + 1
      
    }
}
}