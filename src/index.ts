import "dotenv/config";
import {
  type ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { executarAddTicket } from "./commands/add-ticket";
import { executarOla } from "./commands/ola";
import { executarRoleta } from "./commands/roleta";
import { executarStock } from "./commands/stock";
import { executarTicket } from "./commands/ticket";
import { executarHelp } from "./commands/help";
import { executarremove } from "./commands/remove-tickets"
import { ligarBaseDados } from "./database/database";
import { executarRecompensas } from "./commands/recompensas";
import { executarPity } from "./commands/pity";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});
// ------------- Commands --------------
type CommandHandler = (
  interaction: ChatInputCommandInteraction,
) => Promise<void>;

const commandHandlers: Record<string, CommandHandler> = {
  add: executarAddTicket,
  ola: executarOla,
  roleta: executarRoleta,
  stock: executarStock,
  ticket: executarTicket,
  help: executarHelp,
  remove: executarremove,
  recompensas: executarRecompensas,
  pity: executarPity,
}; // name of commands

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const executarComando = commandHandlers[interaction.commandName];

  if (!executarComando) return;

  try {
    await executarComando(interaction);
  } catch (error) {
    console.error(`Erro no comando /${interaction.commandName}:`, error);

    const resposta = {
      content: "Ocorreu um erro ao executar este comando.",
      flags: MessageFlags.Ephemeral,
    } as const;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(resposta);
    } else {
      await interaction.reply(resposta);
    }
  }
});
// ----- turn on bot & Database ---------

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot iniciado como ${readyClient.user.tag}`);
});



const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("O token do bot não foi encontrado.");
}

async function iniciarBot(): Promise<void> {
  await ligarBaseDados();
  await client.login(token);
}

iniciarBot().catch((error) => {
  console.error("Não foi possível iniciar o bot:", error);
  process.exitCode = 1;
});
