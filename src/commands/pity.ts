import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { User } from "../database/database";

export const pityCommand = {
  name: "pity",
  description: "Verifica o progresso para receber o cargo LCN | Halloween 26.",
};

export async function executarPity(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Este comando só funciona num servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const membro = interaction.member;
const guildId = interaction.guildId;
    if (!guildId) { 
      await interaction.reply({
        content: "Este comando só funciona num servidor.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  
    let utilizador = await User.findOne({
      userId: interaction.user.id,
      guildId,
    });
    if(!utilizador) {
      utilizador = await User.create({
        userId: interaction.user.id,
        guildId,
      });
    }
    if (membro.roles.cache.has("1541241011752402954")) { // 26
    await interaction.reply({
      content: `Você já tem o cargo <@&1541241011752402954> e não pode receber novamente.`,
      flags: MessageFlags.Ephemeral,
    });
  } else if (membro.roles.cache.has("1416440917803536505")) { // 25
    await interaction.reply({
      content: `Falta ${utilizador.pity} / 150 para receber o cargo <@&1541241011752402954>.`,
      flags: MessageFlags.Ephemeral,
    });
  
  } else if (membro.roles.cache.has("1290704724110348299")) { // 24
    await interaction.reply({
      content: `Falta ${utilizador.pity} / 200 para receber o cargo <@&1541241011752402954>.`,
      flags: MessageFlags.Ephemeral,
    });
  }else{
    await interaction.reply({
      content: `Ainda não desbloqueaste o pity, para desbloquear consiga um cargo de halloween e depois utilize o comando /pity.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
