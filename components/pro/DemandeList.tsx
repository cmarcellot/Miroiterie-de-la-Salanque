import Link from "next/link";
import { MESSAGE_STATUS_LABELS, type MessageStatus } from "@/lib/pro-enums";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function DemandeList({
  messages,
  activeId,
  status,
}: {
  messages: any[];
  activeId?: string;
  status?: string;
}) {
  const qs = status ? `?status=${status}` : "";

  return (
    <div className="pro-card pro-inbox-list">
      {messages.length === 0 ? (
        <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
          Aucune demande.
        </p>
      ) : (
        messages.map((m) => {
          const id = String(m._id);
          return (
            <Link
              key={id}
              href={`/pro/demandes/${id}${qs}`}
              className={`pro-inbox-item${id === activeId ? " active" : ""}`}
            >
              <div className="top">
                <span className="nm">{m.name}</span>
                <span className="dt">
                  {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {m.subject && <div className="sub">{m.subject}</div>}
              <div className="tags">
                <span className="pro-tag muted">
                  {m.source === "devis" ? "Devis" : "Contact"}
                </span>
                <span className={`pro-st ${m.status}`}>
                  <i />
                  {MESSAGE_STATUS_LABELS[m.status as MessageStatus] ?? m.status}
                </span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
