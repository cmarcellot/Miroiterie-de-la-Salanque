import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";
import Devis from "@/lib/models/Devis";
import { formatEUR } from "@/lib/pro-enums";
import { getMonthlyRevenue } from "@/lib/factures-stats";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import BarChart from "@/components/pro/BarChart";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectToDatabase();
  const [nouveau, enCours, recents, devisWaiting, revenue] = await Promise.all([
    Message.countDocuments({ status: "nouveau" }),
    Message.countDocuments({ status: "en_cours" }),
    Message.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    Devis.find({ status: { $in: ["brouillon", "envoye"] } }, { totalTTC: 1 }).lean(),
    getMonthlyRevenue(),
  ]);
  const devisCount = devisWaiting.length;
  const devisAmount = (devisWaiting as any[]).reduce(
    (s, d) => s + (d.totalTTC || 0),
    0
  );
  return { nouveau, enCours, recents, devisCount, devisAmount, revenue };
}

export default async function DashboardPage() {
  const { nouveau, enCours, recents, devisCount, devisAmount, revenue } =
    await getStats();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const kpis: Kpi[] = [
    {
      label: "Nouvelles demandes",
      value: nouveau,
      hint: "à traiter",
      href: "/pro/demandes?status=nouveau",
      spark: "0,30 20,26 40,24 60,16 80,14 100,9",
      accent: "var(--marine)",
    },
    {
      label: "Devis en attente",
      value: devisCount,
      hint: `${formatEUR(devisAmount)} en jeu`,
      href: "/pro/devis?tab=envoye",
      spark: "0,20 20,22 40,18 60,20 80,17 100,19",
    },
    {
      label: "En cours",
      value: enCours,
      hint: "demandes en discussion",
      href: "/pro/demandes?status=en_cours",
      spark: "0,12 20,18 40,14 60,24 80,20 100,28",
    },
    {
      label: "CA encaissé ce mois",
      value: revenue.thisMonth,
      display: formatEUR(revenue.thisMonth),
      hint: "factures payées ce mois",
      href: "/pro/factures?tab=payee",
      accent: "var(--ok)",
    },
  ];

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">{today}</div>
          <h1>Tableau de bord</h1>
          <div className="sub">
            {nouveau > 0
              ? `${nouveau} demande${nouveau > 1 ? "s" : ""} du site en attente de traitement.`
              : "Aucune demande en attente. Tout est à jour."}
          </div>
        </div>
        <Link href="/pro/demandes" className="pro-btn solid">
          Voir les demandes
        </Link>
      </div>

      <Kpis items={kpis} />

      <div className="pro-card" style={{ marginTop: 14, padding: "0 20px 14px" }}>
        <div className="pro-chead" style={{ padding: "15px 0" }}>
          <h3>Évolution du CA</h3>
          <span className="pro-lab">6 derniers mois · encaissé</span>
        </div>
        <BarChart data={revenue.series} height={190} color="var(--ok)" />
      </div>

      <div className="pro-card" style={{ marginTop: 14 }}>
        <div className="pro-chead">
          <h3>Dernières demandes</h3>
          <Link href="/pro/demandes" className="pro-lab" style={{ color: "var(--ink-2)" }}>
            Tout voir
          </Link>
        </div>
        {recents.length === 0 ? (
          <p style={{ padding: "24px", color: "var(--ink-3)", fontSize: 13 }}>
            Aucune demande pour l&apos;instant.
          </p>
        ) : (
          <table className="pro-table">
            <tbody>
              {recents.map((m: any) => (
                <tr key={String(m._id)}>
                  <td>
                    <Link
                      href={`/pro/demandes/${m._id}`}
                      style={{ fontWeight: 600 }}
                    >
                      {m.name}
                    </Link>
                    <span className="pro-lab" style={{ marginLeft: 8 }}>
                      {m.source}
                    </span>
                  </td>
                  <td>
                    <span className={`pro-st ${m.status}`}>
                      <i />
                      {MESSAGE_STATUS_LABELS[
                        m.status as keyof typeof MESSAGE_STATUS_LABELS
                      ] ?? m.status}
                    </span>
                  </td>
                  <td
                    className="pro-mono"
                    style={{ textAlign: "right", color: "var(--ink-3)" }}
                  >
                    {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
