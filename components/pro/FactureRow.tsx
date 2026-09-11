"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import { setFactureStatus, deleteFacture } from "@/lib/actions/factures";
import { formatEUR } from "@/lib/pro-enums";

export default function FactureRow({
  id,
  number,
  clientName,
  initials,
  dateLabel,
  dueLabel,
  late,
  status,
  statusLabel,
  amountTTC,
}: {
  id: string;
  number: string;
  clientName: string;
  initials: string;
  dateLabel: string;
  dueLabel: string;
  late: boolean;
  status: string;
  statusLabel: string;
  amountTTC: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/pro/factures/${id}`;

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
      <td style={{ color: late ? "var(--danger)" : "var(--ink-3)" }}>{dueLabel}</td>
      <td>
        <span className={`pro-st facture-${late ? "retard" : status}`}>
          <i />
          {late ? "En retard" : statusLabel}
        </span>
      </td>
      <td className="pro-amt" style={{ textAlign: "right" }}>
        {formatEUR(amountTTC)}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="pro-rowactions">
          {status !== "payee" && (
            <button
              type="button"
              className="ra ra-ok"
              title="Marquer comme payée"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setFactureStatus(id, "payee");
                  router.refresh();
                })
              }
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <Link href={href} className="ra" title="Voir la facture">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <form
            action={deleteFacture.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm(`Supprimer la facture ${number} ?`)) e.preventDefault();
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
