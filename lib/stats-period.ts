/* Périodes sélectionnables sur la page Statistiques, avec la période
   précédente équivalente pour calculer une comparaison ("+12% vs période
   précédente"). Pas de lib de dates dans ce projet (voir lib/factures-stats.ts) :
   on reste sur du Date natif, comme partout ailleurs. */

export const STATS_PERIODS = [
  { id: "30j", label: "30 derniers jours" },
  { id: "3m", label: "3 derniers mois" },
  { id: "12m", label: "12 derniers mois" },
  { id: "annee", label: "Année en cours" },
  { id: "annee_prec", label: "Année précédente" },
  { id: "tout", label: "Depuis le début" },
] as const;

export type StatsPeriod = (typeof STATS_PERIODS)[number]["id"];

export function isStatsPeriod(v: string | undefined): v is StatsPeriod {
  return STATS_PERIODS.some((p) => p.id === v);
}

export function periodLabel(period: StatsPeriod): string {
  return STATS_PERIODS.find((p) => p.id === period)?.label ?? "Période";
}

export type PeriodRange = {
  /** null = pas de borne basse (période "Depuis le début"). */
  start: Date | null;
  end: Date;
  prevStart: Date | null;
  prevEnd: Date | null;
  hasComparison: boolean;
  /** Granularité conseillée pour le graphe d'évolution. */
  granularity: "day" | "month";
};

export function getPeriodRange(period: StatsPeriod): PeriodRange {
  const now = new Date();

  switch (period) {
    case "30j": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      const prevEnd = new Date(start);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 30);
      return { start, end: now, prevStart, prevEnd, hasComparison: true, granularity: "day" };
    }
    case "3m": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      const prevEnd = new Date(start);
      const prevStart = new Date(prevEnd);
      prevStart.setMonth(prevStart.getMonth() - 3);
      return { start, end: now, prevStart, prevEnd, hasComparison: true, granularity: "month" };
    }
    case "12m": {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      const prevEnd = new Date(start);
      const prevStart = new Date(prevEnd);
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      return { start, end: now, prevStart, prevEnd, hasComparison: true, granularity: "month" };
    }
    case "annee": {
      const start = new Date(now.getFullYear(), 0, 1);
      // Comparaison à périmètre égal : même intervalle (1er janv. -> aujourd'hui) l'an dernier.
      const prevStart = new Date(now.getFullYear() - 1, 0, 1);
      const prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return { start, end: now, prevStart, prevEnd, hasComparison: true, granularity: "month" };
    }
    case "annee_prec": {
      const y = now.getFullYear() - 1;
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      const prevStart = new Date(y - 1, 0, 1);
      const prevEnd = new Date(y - 1, 11, 31, 23, 59, 59, 999);
      return { start, end, prevStart, prevEnd, hasComparison: true, granularity: "month" };
    }
    case "tout":
    default:
      return { start: null, end: now, prevStart: null, prevEnd: null, hasComparison: false, granularity: "month" };
  }
}

/** Variation en % entre deux valeurs. null = non comparable (rien sur la période précédente). */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Hint de comparaison prêt à poser sur un Kpi ("+12% vs période précédente"),
 * coloré selon que la variation est bonne ou mauvaise pour ce type de valeur.
 */
export function comparisonHint(
  current: number,
  previous: number,
  hasComparison: boolean,
  higherIsBetter = true
): { hint: string; hintColor?: string } {
  if (!hasComparison) return { hint: "Depuis le début" };
  const delta = pctChange(current, previous);
  if (delta === null) return { hint: "Nouveau sur la période" };
  if (delta === 0) return { hint: "Stable vs période précédente" };
  const sign = delta > 0 ? "+" : "";
  const good = higherIsBetter ? delta > 0 : delta < 0;
  return {
    hint: `${sign}${delta}% vs période précédente`,
    hintColor: good ? "var(--ok)" : "var(--danger)",
  };
}
