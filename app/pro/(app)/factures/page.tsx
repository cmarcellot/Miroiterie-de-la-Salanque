import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Facture, {
  FACTURE_STATUSES,
  FACTURE_STATUS_LABELS,
  isFactureLate,
  type FactureStatus,
} from "@/lib/models/Facture";
import { formatEUR } from "@/lib/pro-enums";

export const dynamic = "force-dynamic";

export default async function FacturesListPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = FACTURE_STATUSES.includes(searchParams.status as FactureStatus)
    ? (searchParams.status as FactureStatus)
    : undefined;

  await connectToDatabase();
  const factures = await Facture.find(status ? { status } : {})
    .sort({ seq: -1, year: -1 })
    .limit(300)
    .lean();

  const impayees = factures.filter((f: any) => f.status === "emise");
  const enRetard = impayees.filter((f: any) => isFactureLate(f));
  const montantDu = impayees.reduce(
    (s: number, f: any) => s + (f.totalTTC || 0),
    0
  );

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Documents</div>
          <h1>Factures</h1>
          <div className="sub">
            {impayees.length} impayée{impayees.length > 1 ? "s" : ""} ·{" "}
            {formatEUR(montantDu)} à encaisser
            {enRetard.length > 0
              ? ` · ${enRetard.length} en retard`
              : ""}
            .
          </div>
        </div>
        <Link href="/pro/factures/nouveau" className="pro-btn solid">
          Nouvelle facture
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <FilterLink label="Toutes" href="/pro/factures" active={!status} />
        {FACTURE_STATUSES.map((s) => (
          <FilterLink
            key={s}
            label={FACTURE_STATUS_LABELS[s]}
            href={`/pro/factures?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <div className="pro-card" style={{ overflowX: "auto" }}>
        {factures.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucune facture.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Émise</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f: any) => {
                const late = isFactureLate(f);
                return (
                  <tr key={String(f._id)}>
                    <td className="num">
                      <Link href={`/pro/factures/${f._id}`}>{f.number}</Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>{f.client?.name || "—"}</td>
                    <td style={{ color: "var(--ink-3)" }}>
                      {f.date
                        ? new Date(f.date).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td
                      style={{
                        color: late ? "var(--danger)" : "var(--ink-3)",
                      }}
                    >
                      {f.dueDate
                        ? new Date(f.dueDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`pro-st facture-${
                          late ? "retard" : f.status
                        }`}
                      >
                        <i />
                        {late
                          ? "En retard"
                          : FACTURE_STATUS_LABELS[
                              f.status as FactureStatus
                            ] ?? f.status}
                      </span>
                    </td>
                    <td className="pro-amt" style={{ textAlign: "right" }}>
                      {formatEUR(f.totalTTC || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`pro-st${active ? " traite" : ""}`}
      style={{ textDecoration: "none" }}
    >
      {label}
    </Link>
  );
}
