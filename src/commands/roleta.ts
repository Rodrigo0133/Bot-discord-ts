import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import "dotenv/config";

const { Client: UnbelievaClient } = require("unb-api");

const token = process.env.UNB_API_TOKEN;

if (!token) {
  throw new Error("Falta UNB_API_TOKEN no .env");
}

const unb = new UnbelievaClient(token);

import { User } from "../database/database";

export const roletaCommand = {
  name: "roleta",
  description:
    "Gira uma roleta para conseguir recompensas com diferentes probabilidades",
};

const premios = [
  { id: "moedas_5000", nome: "5000 Moedas", peso: 34_996 },
  { id: "moedas_10000", nome: "10000 Moedas", peso: 20_000 },
  { id: "level", nome: "+1 Cargo de Level", peso: 14_000 },
  {
    id: "halloween_24",
    nome: "Cargo Halloween 24",
    cargo_id: "1290704724110348299",
    peso: 10_000,
  },
  { id: "vip", nome: "Vip sorteado", peso: 7_000 },
  { id: "exclusivo", nome: "Cargo Exclusivo", peso: 5_000 },
  { id: "moedas_50000", nome: "50000 Moedas", peso: 3_000 },
  {
    id: "halloween_25",
    nome: "Cargo Halloween 25",
    cargo_id: "1416440917803536505",
    peso: 3_000,
  },
  { id: "moedas_100000", nome: "100000 Moedas", peso: 2_000 },
  {
    id: "halloween_26",
    nome: "Cargo Halloween 26",
    cargo_id: "1541241011752402954",
    peso: 1_000,
  },
  {
    id: "halloween_27",
    nome: "Cargo Halloween 27",
    cargo_id: "1541241672212553779",
    peso: 4,
  },
];
interface Premio {
  id: string;
  nome: string;
}
const cargos_exclusivo: Premio[] = [
  {
    id: "1416441848616190152",
    nome: "LCN | Aniversário 25",
  },
  {
    id: "1170564973378940949",
    nome: "LCN | Aniversário 23",
  },
  {
    id: "1440490867281494187",
    nome: "LCN | Xmas 25",
  },
  {
    id: "1312456647913766954",
    nome: "LCN | Xmas 24",
  },
  {
    id: "1185758880190443631",
    nome: "LCN | Xmas 23",
  },
  {
    id: "1057422729768341698",
    nome: "LCN | Xmas 22",
  },
  {
    id: "1498798754633879692",
    nome: "LCN | Contador",
  },
  {
    id: "1497589154282864833",
    nome: "LCN | Liberdade",
  },
  {
    id: "1346869467417940081",
    nome: "LCN | Carnaval",
  },
  {
    id: "1384898827810767003",
    nome: "LCN | Joker",
  },
  {
    id: "1361378551596847224",
    nome: "LCN | Páscoa",
  },
  {
    id: "1471265879625830431",
    nome: "LCN | Valentim",
  },
  {
    id: "1138599410754912296",
    nome: "LCN | 200/2023",
  },
];
const cargos_vips: Premio[] = [
  {
    id: "1522783859639451798",
    nome: "Vip | Ronaldo",
  },
  {
    id: "1537133717598900374",
    nome: "Vip | Mbappé",
  },
  {
    id: "1522785383434424412",
    nome: "Vip | Messi",
  },
  {
    id: "1522784071783022783",
    nome: "Vip | Neymar",
  },
  {
    id: "1537133044295794729",
    nome: "Vip | Haaland",
  },
  {
    id: "1533674249452257402",
    nome: "Vip | Marinheiro",
  },
  {
    id: "1533674383237845082",
    nome: "Vip | Pirata",
  },
  {
    id: "1460686670662734103",
    nome: "Vip | Anjo",
  },
  {
    id: "1460687189418447014",
    nome: "Vip | Demónio",
  },
  {
    id: "1471285788477096007",
    nome: "Vip | Amor",
  },
  {
    id: "1471285788477096007",
    nome: "Vip | Amizade",
  },
  {
    id: "1471287737356128286",
    nome: "Vip | Secreto",
  },
  {
    id: "1471287806071406736",
    nome: "Vip | Próprio",
  },
  {
    id: "1471287848882667540",
    nome: "Vip | Leal",
  },
  {
    id: "1471287876359684159",
    nome: "Vip | Primavera",
  },
  {
    id: "1332549308687581265",
    nome: "Vip | Verão",
  },
  {
    id: "1332548967220776970",
    nome: "Vip | Outono",
  },
  {
    id: "1206229310713626664",
    nome: "Vip | Inverno",
  },
  {
    id: "1141756762547032134",
    nome: "Vip | Verão 23",
  },
  {
    id: "1149793886722605186",
    nome: "Vip | BD Endless",
  },
];

const Roleta_cargos = (Cargos: Premio[]): Premio => {
  const randomElement = Cargos[Math.floor(Math.random() * Cargos.length)];
  return randomElement;
};
export async function executarRoleta(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "Este comando só funciona num servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const utilizador = await User.findOne({
    userId: interaction.user.id,
    guildId,
  });

  if (!utilizador || utilizador.tickets === 0) {
    await interaction.reply({
      content: "Não tens tickets!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!interaction.inCachedGuild()) return;

  const membro = await interaction.guild.members.fetch(interaction.user.id);
  const premio = sortearPremio();
  if (utilizador.tickets <= 0) {
    console.log(0);

    await interaction.reply({
      content: "Não tens tickets!",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  console.log(1);

  utilizador.tickets -= 1;
  await utilizador.save();
  switch (premio.id) {
    case "moedas_5000":
      const saldoAtualizado = await unb.editUserBalance(
        interaction.guildId,
        interaction.user.id,
        { cash: 5000 },
        "Prémio da roleta",
      );
      await interaction.reply(`Parabéns! Conseguiste 5000€`);
      break;
    case "moedas_50000":
      const saldoAtualizado2 = await unb.editUserBalance(
        interaction.guildId,
        interaction.user.id,
        { cash: 50000 },
        "Prémio da roleta",
      );
      await interaction.reply(`Parabéns! Conseguiste 50000€`);
      break;
    case "halloween_24":
      if (!premio.cargo_id) {
        throw new Error(`O prémio ${premio.id} não tem cargo configurado`);
      }
      await membro.roles.add(premio.cargo_id);
      await interaction.reply(`Parabéns! Conseguiste o cargo ${premio.nome}`);
      break;
    case "halloween_25":
      if (!premio.cargo_id) {
        throw new Error(`O prémio ${premio.id} não tem cargo configurado`);
      }
      await membro.roles.add(premio.cargo_id);
      await interaction.reply(`Parabéns! Conseguiste o cargo ${premio.nome}`);
      break;
    case "halloween_26":
      if (!premio.cargo_id) {
        throw new Error(`O prémio ${premio.id} não tem cargo configurado`);
      }
      await membro.roles.add(premio.cargo_id);
      await interaction.reply(`Parabéns! Conseguiste o cargo ${premio.nome}`);
      break;
    case "halloween_27":
      if (!premio.cargo_id) {
        throw new Error(`O prémio ${premio.id} não tem cargo configurado`);
      }
      await membro.roles.add(premio.cargo_id);
      await interaction.reply(`Parabéns! Conseguiste o cargo ${premio.nome}`);
      break;
    case "exclusivo":
      const temTodosOsCargos = cargos_exclusivo.every(({ id }) =>
        membro.roles.cache.has(id),
      );

      if (temTodosOsCargos) {
        await interaction.reply("Já tens todos os cargos exclusivos da roleta!");
        return;
      }
      let random = Roleta_cargos(cargos_exclusivo);
      while (!membro.roles.cache.has(random.id)) {
        let random = Roleta_cargos(cargos_exclusivo);
      }
      await membro.roles.add(random.id);
      await interaction.reply(`Parabéns foi-te atribuido o cargo ${random.nome}`)
      break;
    case "vip":
       const temTodosOsCargos2 = cargos_vips.every(({ id }) =>
         membro.roles.cache.has(id),
       );

       if (temTodosOsCargos2) {
         await interaction.reply(
           "Já tens todos os cargos vips da roleta!",
         );
         return;
       }
       let random2 = Roleta_cargos(cargos_vips);
       while (!membro.roles.cache.has(random2.id)) {
         let random = Roleta_cargos(cargos_vips);
       }
       await membro.roles.add(random2.id);
       await interaction.reply(
         `Parabéns foi-te atribuido o cargo ${random2.nome}`,
       );
      break;
    default:
      console.log(premio.nome);
      break;
  }
}
function sortearPremio() {
  const numeroSorteado = Math.floor(Math.random() * 100_000);

  let acumulado = 0;

  for (const premio of premios) {
    acumulado += premio.peso;

    if (numeroSorteado < acumulado) {
      return premio;
    }
  }

  throw new Error("Nenhum prémio foi sorteado");
}
