export interface PremioRoleta {
  id: string;
  nome: string;
  peso: number;
  cargo_id?: string;
}

// Cada 1000 unidades representam 1%. As seis recompensas menos
// prováveis têm o dobro da probabilidade da distribuição original.
export const TOTAL_PESO = 100_000;
export const premios: readonly PremioRoleta[] = [
  { id: "moedas_5000", nome: "5000 Moedas", peso: 24_000 },
  { id: "moedas_10000", nome: "10000 Moedas", peso: 12_000 },
  { id: "level", nome: "+1 Cargo de Level", peso: 8_000 },
  {
    id: "halloween_24", nome: "Cargo Halloween 24",
    cargo_id: "1290704724110348299", peso: 20_000,
  },
  { id: "vip", nome: "Vip sorteado", peso: 14_000 },
  { id: "exclusivo", nome: "Cargo Exclusivo", peso: 10_000 },
  {
    id: "halloween_25", nome: "Cargo Halloween 25",
    cargo_id: "1416440917803536505", peso: 6_000,
  },
  { id: "moedas_100000", nome: "100000 Moedas", peso: 4_000 },
  {
    id: "halloween_26", nome: "Cargo Halloween 26",
    cargo_id: "1541241011752402954", peso: 2_000,
  },
];

if (premios.reduce((total, premio) => total + premio.peso, 0) !== TOTAL_PESO) {
  throw new Error("As probabilidades da roleta devem totalizar 100%");
}

export function sortearPremio(random: () => number = Math.random): PremioRoleta {
  const numeroSorteado = Math.floor(random() * TOTAL_PESO);
  let acumulado = 0;

  for (const premio of premios) {
    acumulado += premio.peso;
    if (numeroSorteado < acumulado) return premio;
  }

  throw new Error("Nenhum prémio foi sorteado");
}
