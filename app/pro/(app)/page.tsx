import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import { formatEUR } from "@/lib/pro-enums";
import { getMonthlyRevenue } from "@/lib/factures-stats";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import BarChart from "@/components/pro/BarChart";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectToDatabase();
  const [
    nouveau,
    recents,
    devisEnCours,
    devisEnvoye,
    devisAcceptes,
    devisRefuses,
    facturesEmises,
    revenue,
  ] = await Promise.all([
    Message.countDocuments({ status: "nouveau" }),
    Message.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    Devis.countDocuments({ status: { $in: ["brouillon", "envoye"] } }),
    Devis.countDocuments({ status: "envoye" }),
    Devis.countDocuments({ status: "accepte" }),
    Devis.countDocuments({ status: "refuse" }),
    Facture.find({ status: "emise" }, { totalTTC: 1, dueDate: 1 }).lean(),
    getMonthlyRevenue(),
  ]);

  const totalDecides = devisAcceptes + devisRefuses;
  const tauxSignature = totalDecides
    ? Math.round((devisAcceptes / totalDecides) * 100)
    : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const facturesList = facturesEmises as any[];
  const aEncaisser = facturesList.reduce((s, f) => s + (f.totalTTC || 0), 0);
  const facturesEnRetard = facturesList.filter(
    (f) => f.dueDate && new Date(f.dueDate) < new Date()
  ).length;

  return {
    nouveau,
    recents,
    devisEnCours,
    devisEnvoye,
    tauxSignature,
    aEncaisser,
    facturesEnRetard,
    revenue,
  };
}

export default async function DashboardPage() {
  const {
    nouveau,
    recents,
    devisEnCours,
    devisEnvoye,
    tauxSignature,
    aEncaisser,
    facturesEnRetard,
    revenue,
  } = await getStats();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const kpis: Kpi[] = [
    {
      label: "CA du mois",
      value: revenue.thisMonth,
      display: formatEUR(revenue.thisMonth),
      hint: "Factures payées ce mois",
      href: "/pro/factures?tab=payee",
      accent: "var(--ok)",
      spark: "0,26 20,24 40,20 60,18 80,10 100,6",
    },
    {
      label: "Devis en cours",
      value: devisEnCours,
      hint: `${devisEnvoye} en attente de retour`,
      href: "/pro/devis",
      spark: "0,20 20,22 40,18 60,20 80,17 100,15",
    },
    {
      label: "Taux de signature",
      value: tauxSignature,
      suffix: "%",
      hint: "Sur les devis tranchés",
      href: "/pro/devis?tab=accepte",
      accent: "var(--ok)",
      spark: "0,28 20,24 40,22 60,16 80,12 100,8",
    },
    {
      label: "À encaisser",
      value: aEncaisser,
      display: formatEUR(aEncaisser),
      hint:
        facturesEnRetard > 0
          ? `${facturesEnRetard} facture${facturesEnRetard > 1 ? "s" : ""} en retard`
          : "À jour",
      hintColor: facturesEnRetard > 0 ? "var(--danger)" : undefined,
      href: "/pro/factures?tab=pending",
      spark: "0,18 20,20 40,16 60,22 80,19 100,24",
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
