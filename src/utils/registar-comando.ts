import type {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from "discord.js";

function formatarOpcoes(opcoes: readonly CommandInteractionOption[]): string {
  return opcoes.map((opcao) => {
    if (opcao.options) {
      return `${opcao.name} ${formatarOpcoes(opcao.options)}`.trim();
    }
    return `${opcao.name}: ${opcao.value ?? ""}`;
  }).join(" | ");
}

export async function registarComando(
  interaction: ChatInputCommandInteraction,
  ocorreuErro = false,
): Promise<void> {
  const webhook = process.env.WEBHOOK_URL;
  if (!webhook) return;

  try {
    const opcoes = formatarOpcoes(interaction.options.data);
    const content = [
      `${interaction.user.username} (${interaction.user.id}) utilizou /${interaction.commandName}.`,
      `Servidor: ${interaction.guildId ?? "mensagem privada"} | Canal: ${interaction.channelId}`,
      ...(opcoes ? [`Opções: ${opcoes}`] : []),
      ...(ocorreuErro ? ["O comando lançou um erro durante a execução."] : []),
    ].join("\n");

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.slice(0, 2000),
        allowed_mentions: { parse: [] },
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Não foi possível registar /${interaction.commandName}: HTTP ${response.status}.`);
    }
  } catch {
    // Não imprimir o erro de fetch: pode conter o endereço secreto do webhook.
    console.error(`Não foi possível registar /${interaction.commandName} no webhook.`);
  }
}
