import Link from "next/link";
import { Plus } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Devis, { DEVIS_STATUS_LABELS, type DevisStatus } from "@/lib/models/Devis";
import { formatEUR, initialsOf } from "@/lib/pro-enums";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import DevisRow from "@/components/pro/DevisRow";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "Tous" },
  { id: "brouillon", label: "Brouillons" },
  { id: "envoye", label: "Envoyés" },
  { id: "accepte", label: "Acceptés" },
  { id: "refuse", label: "Refusés" },
  { id: "expire", label: "Expirés" },
] as const;

export default async function DevisListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devis = (await Devis.find({})
    .sort({ seq: -1, year: -1 })
    .limit(300)
    .lean()) as any[];

  const counts: Record<string, number> = { all: devis.length };
  for (const t of TABS) {
    if (t.id !== "all") counts[t.id] = devis.filter((d) => d.status === t.id).length;
  }

  const tab = TABS.some((t) => t.id === tabParam) ? (tabParam as string) : "all";
  const visible = tab === "all" ? devis : devis.filter((d) => d.status === tab);

  const sum = (list: any[]) =>
    list.reduce((s, d) => s + (d.totalTTC || 0), 0);
  const envoyes = devis.filter((d) => d.status === "envoye");
  const acceptes = devis.filter((d) => d.status === "accepte");
  const refuses = devis.filter((d) => d.status === "refuse");
  const montantEnvoye = sum(envoyes);
  const montantAccepte = sum(acceptes);
  const totalDecides = acceptes.length + refuses.length;
  const tauxSignature = totalDecides
    ? Math.round((acceptes.length / totalDecides) * 100)
    : 0;

  const kpis: Kpi[] = [
    {
      label: "Acceptés",
      value: montantAccepte,
      display: formatEUR(montantAccepte),
      hint: `${acceptes.length} devis accepté${acceptes.length > 1 ? "s" : ""}`,
      accent: "var(--ok)",
    },
    {
      label: "En attente de réponse",
      value: montantEnvoye,
      display: formatEUR(montantEnvoye),
      hint: `${envoyes.length} devis envoyé${envoyes.length > 1 ? "s" : ""}`,
    },
    {
      label: "Taux de signature",
      value: tauxSignature,
      suffix: "%",
      hint: "sur les devis tranchés",
    },
    {
      label: "Total émis",
      value: devis.length,
      hint: "devis dans le système",
    },
  ];

  return (
    <div>
      <div className="pro-phead">
        <div>
          <h1>Devis</h1>
          <div className="sub">
            {devis.length} devis au total · {counts.brouillon} brouillon
            {counts.brouillon > 1 ? "s" : ""}.
          </div>
        </div>
        <Link href="/pro/devis/nouveau" className="pro-btn solid">
          <Plus className="h-4 w-4" /> Nouveau devis
        </Link>
      </div>

      <Kpis items={kpis} />

      <div className="pro-tblwrap" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-tblhead">
          <div className="pro-tbltabs">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={t.id === "all" ? "/pro/devis" : `/pro/devis?tab=${t.id}`}
                className={`pro-tbltab${tab === t.id ? " active" : ""}`}
              >
                {t.label} · {counts[t.id]}
              </Link>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucun devis.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Date</th>
                <th>Lignes</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <DevisRow
                  key={String(d._id)}
                  id={String(d._id)}
                  number={d.number}
                  clientName={d.client?.name || "—"}
                  initials={initialsOf(d.client?.name || "?")}
                  dateLabel={
                    d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"
                  }
                  lineCount={(d.items || []).length}
                  status={d.status}
                  statusLabel={
                    DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status
                  }
                  amountTTC={d.totalTTC || 0}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
