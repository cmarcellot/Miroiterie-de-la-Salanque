import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Devis, {
  DEVIS_STATUSES,
  DEVIS_STATUS_LABELS,
  type DevisStatus,
} from "@/lib/models/Devis";
import { formatEUR } from "@/lib/pro-enums";

export const dynamic = "force-dynamic";

export default async function DevisListPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = DEVIS_STATUSES.includes(searchParams.status as DevisStatus)
    ? (searchParams.status as DevisStatus)
    : undefined;

  await connectToDatabase();
  const devis = await Devis.find(status ? { status } : {})
    .sort({ seq: -1, year: -1 })
    .limit(300)
    .lean();

  const enAttente = devis.filter(
    (d: any) => d.status === "envoye" || d.status === "brouillon"
  );
  const montantEnJeu = enAttente.reduce(
    (s: number, d: any) => s + (d.totalTTC || 0),
    0
  );

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Documents</div>
          <h1>Devis</h1>
          <div className="sub">
            {enAttente.length} en attente de réponse · {formatEUR(montantEnJeu)}{" "}
            en jeu.
          </div>
        </div>
        <Link href="/pro/devis/nouveau" className="pro-btn solid">
          Nouveau devis
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <FilterLink label="Tous" href="/pro/devis" active={!status} />
        {DEVIS_STATUSES.map((s) => (
          <FilterLink
            key={s}
            label={DEVIS_STATUS_LABELS[s]}
            href={`/pro/devis?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <div className="pro-card" style={{ overflowX: "auto" }}>
        {devis.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucun devis.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {devis.map((d: any) => (
                <tr key={String(d._id)}>
                  <td className="num">
                    <Link href={`/pro/devis/${d._id}`}>{d.number}</Link>
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.client?.name || "—"}</td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {d.date
                      ? new Date(d.date).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td>
                    <span className={`pro-st devis-${d.status}`}>
                      <i />
                      {DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status}
                    </span>
                  </td>
                  <td className="pro-amt" style={{ textAlign: "right" }}>
                    {formatEUR(d.totalTTC || 0)}
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
