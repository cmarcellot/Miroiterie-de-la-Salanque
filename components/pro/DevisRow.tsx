"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Check, ExternalLink, X } from "lucide-react";
import { setDevisStatus, deleteDevis } from "@/lib/actions/devis";
import { formatEUR } from "@/lib/pro-enums";

export default function DevisRow({
  id,
  number,
  clientName,
  initials,
  dateLabel,
  lineCount,
  status,
  statusLabel,
  amountTTC,
}: {
  id: string;
  number: string;
  clientName: string;
  initials: string;
  dateLabel: string;
  lineCount: number;
  status: string;
  statusLabel: string;
  amountTTC: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/pro/devis/${id}`;

  const setStatus = (s: string) =>
    startTransition(async () => {
      await setDevisStatus(id, s);
      router.refresh();
    });

  return (
    <tr className="clickable" onClick={() => router.push(href)}>
      <td className="num">{number}</td>
      <td>
        <div className="pro-namecell">
          <span className="pro-avatar">{initials}</span>
          <div className="nm">{clientName}</div>
        </div>
      </td>
      <td style={{ color: "var(--ink-3)" }}>{dateLabel}</td>
      <td style={{ color: "var(--ink-3)" }}>
        {lineCount} ligne{lineCount > 1 ? "s" : ""}
      </td>
      <td>
        <span className={`pro-st devis-${status}`}>
          <i />
          {statusLabel}
        </span>
      </td>
      <td className="pro-amt" style={{ textAlign: "right" }}>
        {formatEUR(amountTTC)}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="pro-rowactions">
          {status === "brouillon" && (
            <button
              type="button"
              className="ra ra-ok"
              title="Envoyer au client"
              disabled={pending}
              onClick={() => setStatus("envoye")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          {status === "envoye" && (
            <button
              type="button"
              className="ra ra-ok"
              title="Marquer accepté"
              disabled={pending}
              onClick={() => setStatus("accepte")}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <Link href={href} className="ra" title="Voir le devis">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <form
            action={deleteDevis.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm(`Supprimer le devis ${number} ?`)) e.preventDefault();
            }}
          >
            <button type="submit" className="ra ra-danger" title="Supprimer" disabled={pending}>
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
