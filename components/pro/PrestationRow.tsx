"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, X } from "lucide-react";
import { deletePrestation, setPrestationActive } from "@/lib/actions/prestations";
import {
  formatEUR,
  PRESTATION_TYPE_LABELS,
  type PrestationType,
} from "@/lib/pro-enums";
import PrestationModal from "@/components/pro/PrestationModal";

export default function PrestationRow({
  id,
  type,
  name,
  unit,
  unitPrice,
  vatRate,
  description,
  active,
}: {
  id: string;
  type: string;
  name: string;
  unit: string;
  unitPrice: number;
  vatRate: number;
  description?: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <tr>
      <td>
        <div
          style={{
            fontWeight: 500,
            fontSize: 13.5,
            color: active ? "var(--ink)" : "var(--ink-3)",
          }}
        >
          {name}
          {!active && (
            <span className="pro-tag muted" style={{ marginLeft: 8 }}>
              Archivé
            </span>
          )}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </td>
      <td style={{ color: "var(--ink-3)" }}>
        {PRESTATION_TYPE_LABELS[type as PrestationType] ?? type}
      </td>
      <td style={{ color: "var(--ink-3)" }}>{unit}</td>
      <td className="pro-amt">{formatEUR(unitPrice)}</td>
      <td style={{ color: "var(--ink-3)" }}>{vatRate} %</td>
      <td>
        <div className="pro-rowactions">
          <PrestationModal
            iconOnly
            prestation={{ id, type, name, unit, unitPrice, vatRate, description }}
          />
          <button
            type="button"
            className="ra"
            title={active ? "Archiver" : "Réactiver"}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setPrestationActive(id, !active);
                router.refresh();
              })
            }
          >
            {active ? (
              <Archive className="h-3.5 w-3.5" />
            ) : (
              <ArchiveRestore className="h-3.5 w-3.5" />
            )}
          </button>
          <form
            action={deletePrestation.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm(`Supprimer « ${name} » du catalogue ?`))
                e.preventDefault();
            }}
          >
            <button
              type="submit"
              className="ra ra-danger"
              title="Supprimer"
              disabled={pending}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
