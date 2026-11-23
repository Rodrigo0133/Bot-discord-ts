import { DiscordAPIError, RESTJSONErrorCodes, MessageFlags, type GuildMember, type ButtonInteraction } from 'discord.js';
import { consultarSaldos } from '../db/colheitas';
import { cargoParticipante } from './entrar';
import { canalPlantacao } from './plantacao';

async function consultarColecao(membro: GuildMember) {
  const { saldos, totais } = await consultarSaldos(canalPlantacao);
  const saldo = saldos.get(membro.id) ?? 0;
  if (saldo === 0) return { saldo, posicao: null };

  const ganho = totais.get(membro.id) ?? saldo;
  let posicao = 1;
  for (const [id, outroSaldo] of saldos) {
    const outroGanho = totais.get(id) ?? outroSaldo;
    if (id === membro.id || outroSaldo < saldo || (outroSaldo === saldo && outroGanho < ganho)) continue;
    try {
      const candidato = await membro.guild.members.fetch({ user: id, force: true, cache: false });
      if (!candidato.roles.cache.has(cargoParticipante)) continue;
      const empate = outroSaldo === saldo && outroGanho === ganho;
      if (!empate || (candidato.joinedTimestamp !== null && membro.joinedTimestamp !== null &&
          candidato.joinedTimestamp < membro.joinedTimestamp)) posicao++;
    } catch (erro) {
      if (!(erro instanceof DiscordAPIError && erro.code === RESTJSONErrorCodes.UnknownMember)) throw erro;
    }
  }
  return { saldo, posicao };
}

export async function verColecao(interacao: ButtonInteraction) {
  await interacao.deferReply({ flags: MessageFlags.Ephemeral });
  if (!interacao.inCachedGuild() || !interacao.member.roles.cache.has(cargoParticipante)) {
    await interacao.editReply('Entra no evento para veres a tua coleção.');
    return;
  }

  let colecao;
  try {
    colecao = await consultarColecao(interacao.member);
  } catch (erro) {
    console.error('Falha ao consultar a coleção.', erro instanceof Error ? erro.message : erro);
    await interacao.editReply('Não consegui consultar a tua coleção. Tenta novamente.');
    return;
  }

  await interacao.editReply({
    embeds: [{
      title: '🧰 Coleção',
      color: 0xad6f40,
      fields: [
        { name: '🥕 Saldo atual', value: String(colecao.saldo) },
        { name: '✨ Boosts ativos', value: 'Nenhum' },
        { name: '🏆 Ranking', value: colecao.posicao === null ? 'Sem classificação' : `${colecao.posicao}.º lugar` },
      ],
    }],
  });
}
