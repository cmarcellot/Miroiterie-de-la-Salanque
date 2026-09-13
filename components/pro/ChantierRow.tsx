"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { setChantierStatus, deleteChantier } from "@/lib/actions/chantiers";
import { CHANTIER_STATUS_LABELS, nextChantierStatus, type ChantierStatus } from "@/lib/pro-enums";

export default function ChantierRow({
  id,
  number,
  clientName,
  initials,
  title,
  cityLabel,
  dateLabel,
  status,
}: {
  id: string;
  number: string;
  clientName: string;
  initials: string;
  title: string;
  cityLabel: string;
  dateLabel: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/pro/chantiers/${id}`;
  const next = nextChantierStatus(status);

  return (
    <tr className="clickable" onClick={() => router.push(href)}>
      <td className="num">{number}</td>
      <td>
        <div className="pro-namecell">
          <span className="pro-avatar">{initials}</span>
          <div>
            <div className="nm">{clientName}</div>
            <div className="sb">{title}</div>
          </div>
        </div>
      </td>
      <td style={{ color: "var(--ink-3)" }}>{cityLabel || "—"}</td>
      <td style={{ color: "var(--ink-3)" }}>{dateLabel}</td>
      <td>
        <span className={`pro-st chantier-${status}`}>
          <i />
          {CHANTIER_STATUS_LABELS[status as ChantierStatus] ?? status}
        </span>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="pro-rowactions">
          {next && (
            <button
              type="button"
              className="ra ra-ok"
              title={`Marquer « ${CHANTIER_STATUS_LABELS[next]} »`}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setChantierStatus(id, next);
                  router.refresh();
                })
              }
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          <Link href={href} className="ra" title="Voir le chantier">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <form
            action={deleteChantier.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm(`Supprimer le chantier ${number} ?`)) e.preventDefault();
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
