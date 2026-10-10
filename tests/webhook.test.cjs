const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { registarComando } = require("../dist/utils/registar-comando");

const originalFetch = global.fetch;
const originalWebhook = process.env.WEBHOOK_URL;
const originalError = console.error;
afterEach(() => {
  global.fetch = originalFetch;
  console.error = originalError;
  if (originalWebhook === undefined) delete process.env.WEBHOOK_URL;
  else process.env.WEBHOOK_URL = originalWebhook;
});

function interaction(commandName = "add") {
  return {
    commandName,
    user: { username: "Administrador", id: "123" },
    guildId: "456",
    channelId: "789",
    options: { data: [{ name: "ticket", options: [
      { name: "quantidade", value: 3 },
      { name: "utilizador", value: "999" },
    ] }] },
  };
}

test("sem webhook, não envia pedidos nem impede a execução", async () => {
  delete process.env.WEBHOOK_URL;
  global.fetch = () => assert.fail("Não deveria chamar fetch");
  await registarComando(interaction());
});

test("regista autor, comando, subcomando, quantidade e destinatário real", async () => {
  process.env.WEBHOOK_URL = "https://example.invalid/webhook";
  let body;
  global.fetch = async (url, options) => {
    assert.equal(url, process.env.WEBHOOK_URL);
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.ok(options.signal instanceof AbortSignal);
    body = JSON.parse(options.body);
    return { ok: true };
  };
  await registarComando(interaction());
  assert.match(body.content, /Administrador \(123\).*\/add/);
  assert.match(body.content, /Servidor: 456 \| Canal: 789/);
  assert.match(body.content, /ticket quantidade: 3 \| utilizador: 999/);
  assert.deepEqual(body.allowed_mentions, { parse: [] });
});

test("suporta comandos sem opções em mensagens privadas", async () => {
  process.env.WEBHOOK_URL = "https://example.invalid/webhook";
  global.fetch = async (_, options) => {
    const { content } = JSON.parse(options.body);
    assert.match(content, /\/ola/);
    assert.match(content, /mensagem privada/);
    assert.doesNotMatch(content, /Opções:/);
    return { ok: true };
  };
  await registarComando({ ...interaction("ola"), guildId: null, options: { data: [] } });
});

test("limita a mensagem a 2000 caracteres e assinala erros de execução", async () => {
  process.env.WEBHOOK_URL = "https://example.invalid/webhook";
  const bodies = [];
  global.fetch = async (_, options) => {
    bodies.push(JSON.parse(options.body));
    return { ok: true };
  };
  await registarComando(interaction(), true);
  assert.match(bodies[0].content, /lançou um erro/);
  await registarComando({ ...interaction(), options: { data: [{ name: "texto", value: "x".repeat(3000) }] } });
  assert.equal(bodies[1].content.length, 2000);
});

test("falhas HTTP, rede e timeout não escapam nem expõem o webhook", async () => {
  process.env.WEBHOOK_URL = "https://example.invalid/segredo";
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));
  global.fetch = async () => ({ ok: false, status: 429 });
  await registarComando(interaction());
  assert.match(errors[0], /HTTP 429/);
  for (const name of ["TypeError", "TimeoutError"]) {
    global.fetch = async () => { throw Object.assign(new Error(process.env.WEBHOOK_URL), { name }); };
    await registarComando(interaction());
  }
  assert.equal(errors.length, 3);
  assert.ok(errors.every((message) => !message.includes("segredo")));
});

// Carrega o dispatcher com serviços simulados, sem iniciar um bot ou tocar na BD.
function loadDispatcher(failing = false) {
  let dispatch;
  const executed = [];
  const logs = [];
  class Client {
    on(_, callback) { dispatch = callback; }
    once() {}
    async login() {}
  }
  vm.runInNewContext(fs.readFileSync(require.resolve("../dist/index.js"), "utf8"), {
    exports: {},
    process: { env: { DISCORD_TOKEN: "simulado" } },
    console: { error() {}, log() {} },
    require(name) {
      if (name === "dotenv/config") return {};
      if (name === "discord.js") return { Client, Events: {}, GatewayIntentBits: { Guilds: 1 }, MessageFlags: { Ephemeral: 64 } };
      if (name.includes("/database/")) return { ligarBaseDados: async () => {} };
      if (name.includes("/utils/")) return { registarComando: async (i, error) => logs.push({ command: i.commandName, error }) };
      if (name.startsWith("./commands/")) return new Proxy({}, {
        get: (_, handler) => async (i) => {
          executed.push({ command: i.commandName, handler });
          if (failing) throw new Error("Falha simulada");
          await i.reply("Resposta do comando");
        },
      });
      throw new Error(`Import inesperado: ${name}`);
    },
  });
  return { dispatch, executed, logs };
}

test("os dez comandos respondem antes de serem registados, uma vez cada", async () => {
  const { dispatch, executed, logs } = loadDispatcher();
  for (const command of ["add", "ola", "roleta", "stock", "ticket", "help", "remove", "recompensas", "pity", "buy-ticket"]) {
    let replied = false;
    await dispatch({
      commandName: command,
      isChatInputCommand: () => true,
      reply: async () => {
        assert.equal(logs.length, executed.length - 1);
        replied = true;
      },
    });
    assert.ok(replied);
    assert.equal(logs.at(-1).command, command);
    assert.equal(logs.at(-1).error, false);
  }
  assert.equal(executed.length, 10);
  assert.equal(logs.length, 10);
});

test("erros são registados com resposta inicial, diferida ou já enviada", async () => {
  for (const method of ["reply", "editReply", "followUp"]) {
    const { dispatch, logs } = loadDispatcher(true);
    const called = [];
    await dispatch({
      commandName: "add",
      isChatInputCommand: () => true,
      deferred: method === "editReply",
      replied: method === "followUp",
      [method]: async () => called.push(method),
    });
    assert.deepEqual(called, [method]);
    assert.deepEqual(logs, [{ command: "add", error: true }]);
  }
});

test("ignora interações que não são comandos e comandos desconhecidos", async () => {
  const { dispatch, executed, logs } = loadDispatcher();
  await dispatch({ isChatInputCommand: () => false });
  await dispatch({ isChatInputCommand: () => true, commandName: "desconhecido" });
  assert.equal(executed.length, 0);
  assert.equal(logs.length, 0);
});
