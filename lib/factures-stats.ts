import { connectToDatabase } from "@/lib/mongodb";
import Facture from "@/lib/models/Facture";

const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/** CA encaissé (factures payées) des 6 derniers mois, mois courant inclus. */
export async function getMonthlyRevenue(months = 6) {
  await connectToDatabase();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paid: any[] = await Facture.find(
    { status: "payee", paidAt: { $gte: start } },
    { paidAt: 1, totalTTC: 1 }
  ).lean();

  const buckets = new Map<string, number>();
  for (const f of paid) {
    if (!f.paidAt) continue;
    const d = new Date(f.paidAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, (buckets.get(key) || 0) + (f.totalTTC || 0));
  }

  const series: { label: string; value: number; highlight: boolean }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    series.push({
      label: MONTH_FMT.format(d),
      value: Math.round(buckets.get(key) || 0),
      highlight: i === 0,
    });
  }

  return {
    series,
    thisMonth: series[series.length - 1]?.value ?? 0,
  };
}
