import { loadEnvFile } from 'node:process';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { responderAoBotao } from './buttons/painel';
import { canalId, publicarPainel } from './painel';

if (!process.env.DISCORD_TOKEN) loadEnvFile();
const cliente = new Client({ intents: [GatewayIntentBits.Guilds] });

cliente.once(Events.ClientReady, bot => {
  publicarPainel(bot).catch(erro => {
    console.error('Falha ao publicar o painel.', erro.message);
    cliente.destroy();
    process.exitCode = 1;
  });
});

cliente.on(Events.InteractionCreate, interacao => {
  if (interacao.isButton() && interacao.channelId === canalId) {
    responderAoBotao(interacao).catch(erro => console.error('Falha ao responder ao botão.', erro.message));
  }
});

cliente.login(process.env.DISCORD_TOKEN).catch(erro => {
  console.error('Falha ao ligar o bot.', erro.message);
  process.exitCode = 1;
});
