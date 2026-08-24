import "dotenv/config";
import { REST, Routes } from "discord.js";
import { addCommand } from "./commands/add-ticket";
import { olaCommand } from "./commands/ola";
import { roletaCommand } from "./commands/roleta";
import { stockCommand } from "./commands/stock";
import { ticketCommand } from "./commands/ticket";

const commands = [
  olaCommand,
  ticketCommand,
  roletaCommand,
  stockCommand,
  addCommand,
];

async function registarComandos(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error(
      "Faltam DISCORD_TOKEN, CLIENT_ID ou GUILD_ID no ficheiro .env",
    );
  }

  const rest = new REST({ version: "10" }).setToken(token);

  console.log("A registar os comandos...");

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });

  console.log("Comandos registados com sucesso");
}

registarComandos().catch((error) => {
  console.error("Erro ao registar os comandos:", error);
  process.exitCode = 1;
});
