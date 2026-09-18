import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Devis, { DEVIS_STATUSES, DEVIS_STATUS_LABELS, type DevisStatus } from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier, {
  CHANTIER_STATUSES,
  CHANTIER_STATUS_LABELS,
  type ChantierStatus,
} from "@/lib/models/Chantier";
import {
  type StatsPeriod,
  type PeriodRange,
  getPeriodRange,
  comparisonHint,
} from "@/lib/stats-period";

const DAY_FMT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });
const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" });

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

type Bucket = { label: string; from: Date; to: Date };

function buildDayBuckets(from: Date, to: Date): Bucket[] {
  const buckets: Bucket[] = [];
  let cur = startOfDay(from);
  const last = startOfDay(to);
  let guard = 0;
  while (cur <= last && guard < 62) {
    buckets.push({ label: DAY_FMT.format(cur), from: startOfDay(cur), to: endOfDay(cur) });
    cur = new Date(cur);
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return buckets;
}

function buildMonthBuckets(from: Date, to: Date): Bucket[] {
  const buckets: Bucket[] = [];
  let cur = startOfMonth(from);
  const last = startOfMonth(to);
  let guard = 0;
  // Plafond à 36 mois : évite un graphe interminable sur "Depuis le début" avec un vieil historique.
  while (cur <= last && guard < 36) {
    buckets.push({ label: MONTH_FMT.format(cur), from: startOfMonth(cur), to: endOfMonth(cur) });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    guard++;
  }
  return buckets;
}

export type StatsData = {
  period: StatsPeriod;
  range: PeriodRange;
  kpis: {
    caEncaisse: { value: number; hint: string; hintColor?: string };
    tauxSignature: { value: number; hint: string; hintColor?: string };
    nouveauxClients: { value: number; hint: string; hintColor?: string };
    panierMoyen: { value: number; hint: string; hintColor?: string };
  };
  chart: { label: string; value: number; highlight: boolean }[];
  devisParStatut: { status: DevisStatus; label: string; count: number; pct: number }[];
  chantiersParStatut: { status: ChantierStatus; label: string; count: number; pct: number }[];
  topClients: { name: string; href: string | null; total: number }[];
  situationActuelle: { impayeTotal: number; enRetardCount: number; enRetardMontant: number };
};

export async function getStatsData(period: StatsPeriod): Promise<StatsData> {
  await connectToDatabase();
  const range = getPeriodRange(period);

  // Pour "Depuis le début" (pas de borne basse), le graphe part de la 1ère facture payée connue.
  let chartFrom = range.start;
  if (!chartFrom) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const earliest = (await Facture.findOne({ status: "payee" }, { paidAt: 1 })
      .sort({ paidAt: 1 })
      .lean()) as any;
    if (earliest?.paidAt) {
      chartFrom = new Date(earliest.paidAt);
    } else {
      chartFrom = new Date();
      chartFrom.setFullYear(chartFrom.getFullYear() - 1);
    }
  }
  const buckets =
    range.granularity === "day" ? buildDayBuckets(chartFrom, range.end) : buildMonthBuckets(chartFrom, range.end);

  const [facturesPayees, facturesPayeesPrev, devisRange, devisPrev, chantiersRange, nouveauxClients, nouveauxClientsPrev, facturesEnCours] =
    await Promise.all([
      Facture.find(
        { status: "payee", paidAt: { $gte: chartFrom, $lte: range.end } },
        { totalTTC: 1, paidAt: 1, clientId: 1, client: 1 }
      ).lean(),
      range.hasComparison
        ? Facture.find(
            { status: "payee", paidAt: { $gte: range.prevStart!, $lte: range.prevEnd! } },
            { totalTTC: 1 }
          ).lean()
        : Promise.resolve([]),
      Devis.find({ date: { $gte: chartFrom, $lte: range.end } }, { status: 1, totalTTC: 1 }).lean(),
      range.hasComparison
        ? Devis.find(
            { date: { $gte: range.prevStart!, $lte: range.prevEnd! } },
            { status: 1, totalTTC: 1 }
          ).lean()
        : Promise.resolve([]),
      Chantier.find({ createdAt: { $gte: chartFrom, $lte: range.end } }, { status: 1 }).lean(),
      Client.countDocuments({ createdAt: { $gte: chartFrom, $lte: range.end } }),
      range.hasComparison
        ? Client.countDocuments({ createdAt: { $gte: range.prevStart!, $lte: range.prevEnd! } })
        : Promise.resolve(0),
      Facture.find({ status: "emise" }, { totalTTC: 1, dueDate: 1 }).lean(),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidList = facturesPayees as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidPrevList = facturesPayeesPrev as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devisList = devisRange as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devisPrevList = devisPrev as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chantiersList = chantiersRange as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const facturesEnCoursList = facturesEnCours as any[];

  // ---- CA encaissé + graphe d'évolution ----
  const caEncaisse = paidList.reduce((s, f) => s + (f.totalTTC || 0), 0);
  const caEncaissePrev = paidPrevList.reduce((s, f) => s + (f.totalTTC || 0), 0);

  const chart = buckets.map((b, i) => {
    const value = paidList
      .filter((f) => f.paidAt && new Date(f.paidAt) >= b.from && new Date(f.paidAt) <= b.to)
      .reduce((s, f) => s + (f.totalTTC || 0), 0);
    return { label: b.label, value: Math.round(value), highlight: i === buckets.length - 1 };
  });

  // ---- Devis : taux de signature + panier moyen des devis acceptés ----
  function tauxSignatureOf(list: { status?: string }[]) {
    const acceptes = list.filter((d) => d.status === "accepte").length;
    const refuses = list.filter((d) => d.status === "refuse").length;
    const total = acceptes + refuses;
    return total ? Math.round((acceptes / total) * 100) : 0;
  }
  function panierMoyenOf(list: { status?: string; totalTTC?: number }[]) {
    const acceptes = list.filter((d) => d.status === "accepte");
    if (!acceptes.length) return 0;
    return Math.round(acceptes.reduce((s, d) => s + (d.totalTTC || 0), 0) / acceptes.length);
  }
  const tauxSignature = tauxSignatureOf(devisList);
  const tauxSignaturePrev = tauxSignatureOf(devisPrevList);
  const panierMoyen = panierMoyenOf(devisList);
  const panierMoyenPrev = panierMoyenOf(devisPrevList);

  // ---- Répartitions par statut ----
  const devisParStatut = DEVIS_STATUSES.map((status) => {
    const count = devisList.filter((d) => d.status === status).length;
    return {
      status,
      label: DEVIS_STATUS_LABELS[status],
      count,
      pct: devisList.length ? Math.round((count / devisList.length) * 100) : 0,
    };
  });
  const chantiersParStatut = CHANTIER_STATUSES.map((status) => {
    const count = chantiersList.filter((c) => c.status === status).length;
    return {
      status,
      label: CHANTIER_STATUS_LABELS[status],
      count,
      pct: chantiersList.length ? Math.round((count / chantiersList.length) * 100) : 0,
    };
  });

  // ---- Top clients (CA encaissé sur la période) ----
  const clientMap = new Map<string, { name: string; href: string | null; total: number }>();
  for (const f of paidList) {
    const id = f.clientId ? String(f.clientId) : null;
    const key = id ?? `anon:${f.client?.name ?? "?"}`;
    const existing = clientMap.get(key);
    if (existing) existing.total += f.totalTTC || 0;
    else
      clientMap.set(key, {
        name: f.client?.name || "Client",
        href: id ? `/pro/clients/${id}` : null,
        total: f.totalTTC || 0,
      });
  }
  const topClients = [...clientMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);

  // ---- Situation actuelle (impayés) : instantané, indépendant de la période ----
  const impayeTotal = facturesEnCoursList.reduce((s, f) => s + (f.totalTTC || 0), 0);
  const enRetardList = facturesEnCoursList.filter((f) => f.dueDate && new Date(f.dueDate) < new Date());
  const enRetardMontant = enRetardList.reduce((s, f) => s + (f.totalTTC || 0), 0);

  return {
    period,
    range,
    kpis: {
      caEncaisse: { value: caEncaisse, ...comparisonHint(caEncaisse, caEncaissePrev, range.hasComparison) },
      tauxSignature: {
        value: tauxSignature,
        ...comparisonHint(tauxSignature, tauxSignaturePrev, range.hasComparison),
      },
      nouveauxClients: {
        value: nouveauxClients,
        ...comparisonHint(nouveauxClients, nouveauxClientsPrev, range.hasComparison),
      },
      panierMoyen: { value: panierMoyen, ...comparisonHint(panierMoyen, panierMoyenPrev, range.hasComparison) },
    },
    chart,
    devisParStatut,
    chantiersParStatut,
    topClients,
    situationActuelle: {
      impayeTotal,
      enRetardCount: enRetardList.length,
      enRetardMontant,
    },
  };
}
