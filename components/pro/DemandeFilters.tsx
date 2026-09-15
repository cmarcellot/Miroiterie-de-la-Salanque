import Link from "next/link";
import { MESSAGE_STATUSES, MESSAGE_STATUS_LABELS } from "@/lib/pro-enums";

/** Filtres de statut — mènent toujours à la liste (une nouvelle sélection n'a plus de sens sous un autre filtre). */
export default function DemandeFilters({
  status,
  counts,
}: {
  status?: string;
  counts: Record<string, number>;
}) {
  return (
    <div className="pro-tblwrap" style={{ marginBottom: 14 }}>
      <div className="pro-tblhead">
        <div className="pro-tbltabs">
          <Link
            href="/pro/demandes"
            className={`pro-tbltab${!status ? " active" : ""}`}
          >
            Toutes · {counts.all ?? 0}
          </Link>
          {MESSAGE_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/pro/demandes?status=${s}`}
              className={`pro-tbltab${status === s ? " active" : ""}`}
            >
              {MESSAGE_STATUS_LABELS[s]} · {counts[s] ?? 0}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
