import { ligarBaseDados, desligarBaseDados } from './db/ligacao';
import { loadEnvFile } from 'node:process';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { responderAoBotao } from './buttons/painel';
import { canalId, publicarPainel } from './painel';

import { botaoColher, canalPlantacao, criarPlantacao } from './buttons/plantacao';

const plantacao = criarPlantacao();
try {
  loadEnvFile();
} catch (erro) {
  if ((erro as NodeJS.ErrnoException).code !== 'ENOENT') throw erro;
}
const cliente = new Client({ intents: [GatewayIntentBits.Guilds] });

cliente.once(Events.ClientReady, bot => {
  publicarPainel(bot).then(() => plantacao.iniciar(bot)).catch(erro => {
    console.error('Falha ao iniciar o evento.', erro.message);
    cliente.destroy();
    void desligarBaseDados();
    process.exitCode = 1;
  });
});

cliente.on(Events.InteractionCreate, interacao => {
  if (!interacao.isButton()) return;
  if (interacao.channelId === canalPlantacao && interacao.customId === botaoColher) {
    plantacao.colher(interacao).catch(erro => console.error('Falha na colheita.', erro.message));
  } else if (interacao.channelId === canalId) {
    responderAoBotao(interacao).catch(erro => console.error('Falha ao responder ao botão.', erro.message));
  }
});

async function ligar() {
  await ligarBaseDados();
  await cliente.login(process.env.DISCORD_TOKEN);
}

ligar().catch(async erro => {
  await desligarBaseDados();
  console.error('Falha ao ligar o bot.', erro.message);
  process.exitCode = 1;
});
