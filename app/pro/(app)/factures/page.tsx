import Link from "next/link";
import { Plus } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Facture, {
  FACTURE_STATUS_LABELS,
  isFactureLate,
  type FactureStatus,
} from "@/lib/models/Facture";
import { formatEUR, initialsOf } from "@/lib/pro-enums";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import FactureRow from "@/components/pro/FactureRow";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "Toutes" },
  { id: "payee", label: "Payées" },
  { id: "pending", label: "En attente" },
  { id: "late", label: "En retard" },
] as const;

export default async function FacturesListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factures = (await Facture.find({})
    .sort({ seq: -1, year: -1 })
    .limit(300)
    .lean()) as any[];

  const payees = factures.filter((f) => f.status === "payee");
  const impayees = factures.filter((f) => f.status === "emise");
  const enRetard = impayees.filter((f) => isFactureLate(f));
  const enAttente = impayees.filter((f) => !isFactureLate(f));

  const sum = (list: any[]) =>
    list.reduce((s, f) => s + (f.totalTTC || 0), 0);
  const montantEncaisse = sum(payees);
  const montantEnAttente = sum(enAttente);
  const montantEnRetard = sum(enRetard);

  const tab = TABS.some((t) => t.id === tabParam) ? tabParam : "all";
  const visible =
    tab === "payee"
      ? payees
      : tab === "pending"
        ? enAttente
        : tab === "late"
          ? enRetard
          : factures;

  const counts: Record<string, number> = {
    all: factures.length,
    payee: payees.length,
    pending: enAttente.length,
    late: enRetard.length,
  };

  const kpis: Kpi[] = [
    {
      label: "Encaissé",
      value: montantEncaisse,
      display: formatEUR(montantEncaisse),
      hint: `${payees.length} facture${payees.length > 1 ? "s" : ""} payée${payees.length > 1 ? "s" : ""}`,
      accent: "var(--ok)",
    },
    {
      label: "En attente",
      value: montantEnAttente,
      display: formatEUR(montantEnAttente),
      hint: `${enAttente.length} facture${enAttente.length > 1 ? "s" : ""}`,
    },
    {
      label: "En retard",
      value: montantEnRetard,
      display: formatEUR(montantEnRetard),
      hint: `${enRetard.length} en retard`,
      valueColor: enRetard.length > 0 ? "var(--danger)" : undefined,
    },
    {
      label: "Total émis",
      value: factures.length,
      hint: "factures dans le système",
    },
  ];

  return (
    <div>
      <div className="pro-phead">
        <div>
          <h1>Factures</h1>
          <div className="sub">
            {formatEUR(montantEncaisse)} encaissés ·{" "}
            {formatEUR(montantEnAttente + montantEnRetard)} en attente
          </div>
        </div>
        <Link href="/pro/factures/nouveau" className="pro-btn solid">
          <Plus className="h-4 w-4" /> Nouvelle facture
        </Link>
      </div>

      <Kpis items={kpis} />

      <div className="pro-tblwrap" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-tblhead">
          <div className="pro-tbltabs">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={t.id === "all" ? "/pro/factures" : `/pro/factures?tab=${t.id}`}
                className={`pro-tbltab${tab === t.id ? " active" : ""}`}
              >
                {t.label} · {counts[t.id]}
              </Link>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucune facture.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Émise</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => {
                const late = isFactureLate(f);
                return (
                  <FactureRow
                    key={String(f._id)}
                    id={String(f._id)}
                    number={f.number}
                    clientName={f.client?.name || "—"}
                    initials={initialsOf(f.client?.name || "?")}
                    dateLabel={
                      f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—"
                    }
                    dueLabel={
                      f.dueDate
                        ? new Date(f.dueDate).toLocaleDateString("fr-FR")
                        : "—"
                    }
                    late={late}
                    status={f.status}
                    statusLabel={
                      FACTURE_STATUS_LABELS[f.status as FactureStatus] ?? f.status
                    }
                    amountTTC={f.totalTTC || 0}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
