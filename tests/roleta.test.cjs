const { test } = require("node:test");
const assert = require("node:assert/strict");
const { premios, TOTAL_PESO, sortearPremio } = require("../dist/config/premios-roleta");
const { executarRecompensas } = require("../dist/commands/recompensas");

const anteriores = {
  moedas_5000: 38000, moedas_10000: 20000, level: 14000,
  halloween_24: 10000, vip: 7000, exclusivo: 5000,
  halloween_25: 3000, moedas_100000: 2000, halloween_26: 1000,
};

test("sorte 2x duplica as seis recompensas menos prováveis e reduz as comuns", () => {
  assert.equal(premios.length, Object.keys(anteriores).length);
  assert.equal(new Set(premios.map(({ id }) => id)).size, premios.length);
  for (const premio of premios) {
    assert.ok(Number.isInteger(premio.peso) && premio.peso > 0);
    if (anteriores[premio.id] <= 10000) {
      assert.equal(premio.peso, anteriores[premio.id] * 2, premio.id);
    } else {
      assert.ok(premio.peso < anteriores[premio.id], premio.id);
    }
  }
  assert.equal(TOTAL_PESO, 100000);
  assert.equal(premios.reduce((total, premio) => total + premio.peso, 0), TOTAL_PESO);
});

test("todos os 100000 resultados possíveis respeitam os pesos, sem lacunas", () => {
  const contagens = Object.fromEntries(premios.map(({ id }) => [id, 0]));
  for (let numero = 0; numero < TOTAL_PESO; numero++) {
    // O ponto médio evita erros de arredondamento nas fronteiras de Math.floor.
    const premio = sortearPremio(() => (numero + 0.5) / TOTAL_PESO);
    contagens[premio.id]++;
  }
  for (const premio of premios) assert.equal(contagens[premio.id], premio.peso);
  assert.equal(sortearPremio(() => 0).id, premios[0].id);
  assert.equal(sortearPremio(() => 1 - Number.EPSILON).id, premios.at(-1).id);
});

test("/recompensas mostra apenas prémios existentes com a probabilidade real", async () => {
  let resposta;
  const avatar = () => "https://example.invalid/avatar.png";
  await executarRecompensas({
    client: { user: { displayAvatarURL: avatar } },
    user: { username: "Teste", displayAvatarURL: avatar },
    reply: async (payload) => { resposta = payload; },
  });
  const campos = resposta.embeds[0].toJSON().fields;
  const linhas = campos.find(({ name }) => name === "Recompensas").value.split("\n");
  assert.equal(linhas.length, premios.length);
  premios.forEach((premio, indice) => {
    assert.ok(linhas[indice].startsWith(`\`${premio.peso / 1000}%\``));
    assert.ok(linhas[indice].includes(premio.cargo_id ?? premio.nome));
  });
});
