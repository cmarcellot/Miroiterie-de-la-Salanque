import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Message, {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_LABELS,
  type MessageStatus,
} from "@/lib/models/Message";

export const dynamic = "force-dynamic";

export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = MESSAGE_STATUSES.includes(statusParam as MessageStatus)
    ? (statusParam as MessageStatus)
    : undefined;

  await connectToDatabase();
  const messages = await Message.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Boîte de réception</div>
          <h1>Demandes</h1>
          <div className="sub">
            Demandes de contact et de devis reçues depuis le site vitrine.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <FilterLink label="Toutes" href="/pro/demandes" active={!status} />
        {MESSAGE_STATUSES.map((s) => (
          <FilterLink
            key={s}
            label={MESSAGE_STATUS_LABELS[s]}
            href={`/pro/demandes?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <div className="pro-card" style={{ overflowX: "auto" }}>
        {messages.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucune demande.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Reçue le</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m: any) => (
                <tr key={String(m._id)}>
                  <td>
                    <Link
                      href={`/pro/demandes/${m._id}`}
                      style={{ fontWeight: 600 }}
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {m.source === "devis" ? "Devis" : "Contact"}
                  </td>
                  <td>
                    <span className={`pro-st ${m.status}`}>
                      <i />
                      {MESSAGE_STATUS_LABELS[m.status as MessageStatus] ??
                        m.status}
                    </span>
                  </td>
                  <td
                    className="pro-mono"
                    style={{ textAlign: "right", color: "var(--ink-3)" }}
                  >
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
