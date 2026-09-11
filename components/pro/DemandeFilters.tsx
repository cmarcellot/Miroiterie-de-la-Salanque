import Link from "next/link";
import { MESSAGE_STATUSES, MESSAGE_STATUS_LABELS } from "@/lib/pro-enums";

/** Filtres de statut — mènent toujours à la liste (une nouvelle sélection n'a plus de sens sous un autre filtre). */
export default function DemandeFilters({ status }: { status?: string }) {
  return (
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
