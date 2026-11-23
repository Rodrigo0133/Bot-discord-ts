import { join } from 'node:path';
import {
  AttachmentBuilder, ButtonStyle, ChannelType, ComponentType, ContainerBuilder, MessageFlags,
  type Client, type Message, type TextChannel,
} from 'discord.js';
import { idBotao, opcoes } from './buttons/painel';

import { canalPlantacao } from './buttons/plantacao';

export const canalId = '1416179242496032798';

export function criarPainel(servidor: string) {
  const caixa = new ContainerBuilder().setAccentColor(0xad6f40);
  const files: AttachmentBuilder[] = [];
  function adicionarImagem(nome: string, descricao: string) {
    const caminho = join(__dirname, '..', 'assets', nome);
    files.push(new AttachmentBuilder(caminho, { name: nome }));
    caixa.addMediaGalleryComponents(galeria => galeria.addItems(
      item => item.setURL(`attachment://${nome}`).setDescription(descricao),
    ));
  }

  caixa.addTextDisplayComponents(texto => texto.setContent(
    '# LCNXMAS: Evento de Natal 2026\nParticipa no **Evento de Natal da LCN**. Recolhe **cenouras** para comprar recursos, incluindo o **novo cargo de Natal**.',
  ));
  adicionarImagem('LCNXMAS_banner.png', 'LCNXMAS — Evento de Natal 2026');
  for (const [indice, opcao] of opcoes.entries()) {
    if (indice === 4) {
      adicionarImagem('Divisor_Natalicio_com_Azevinho_e_Luzes.png', 'Faixa de Natal com luzes e azevinho');
    }
    caixa.addSectionComponents(secao => secao
      .addTextDisplayComponents(texto => texto.setContent(
        `${opcao.icone} **${indice + 1}º · ${opcao.titulo}**\n${opcao.descricao}`,
      ))
      .setButtonAccessory(botao => {
        botao.setLabel(opcao.botao).setEmoji({ name: opcao.emoji });
        if (opcao.id === 'plantacao') {
          return botao.setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${servidor}/${canalPlantacao}`);
        }
        return botao.setCustomId(idBotao(opcao.id)).setStyle(opcao.estilo);
      }));
  }
  return { components: [caixa], flags: MessageFlags.IsComponentsV2 as const, files, allowedMentions: { parse: [] } };
}

async function procurarPainel(canal: TextChannel, botId: string): Promise<Message | undefined> {
  let before: string | undefined;
  do {
    const mensagens = await canal.messages.fetch({ limit: 100, before, cache: false });
    const painel = mensagens.find(msg => msg.author.id === botId && msg.components.some(
      caixa => caixa.type === ComponentType.Container && caixa.components.some(
        secao => secao.type === ComponentType.Section &&
          secao.accessory.type === ComponentType.Button &&
          secao.accessory.customId === idBotao('entrar'),
      ),
    ));
    if (painel || mensagens.size < 100) return painel;
    before = mensagens.lastKey();
  } while (before);
}

export async function publicarPainel(cliente: Client<true>) {
  const canal = await cliente.channels.fetch(canalId);
  if (canal?.type !== ChannelType.GuildText) throw new Error('Canal de texto do evento indisponível.');
  const anterior = await procurarPainel(canal, cliente.user.id);
  const painel = criarPainel(canal.guildId);
  const mensagem = anterior
    ? await anterior.edit({ ...painel, attachments: [] })
    : await canal.send(painel);
  console.log(`Painel disponível em ${mensagem.url}`);
}
