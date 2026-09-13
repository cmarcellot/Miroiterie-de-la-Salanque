import Link from "next/link";
import { Plus } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Chantier from "@/lib/models/Chantier";
import { initialsOf } from "@/lib/pro-enums";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import ChantierRow from "@/components/pro/ChantierRow";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "Tous" },
  { id: "a_planifier", label: "À planifier" },
  { id: "planifie", label: "Planifiés" },
  { id: "en_cours", label: "En cours" },
  { id: "termine", label: "Terminés" },
  { id: "annule", label: "Annulés" },
] as const;

export default async function ChantiersListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chantiers = (await Chantier.find({})
    .sort({ seq: -1, year: -1 })
    .limit(300)
    .lean()) as any[];

  const counts: Record<string, number> = { all: chantiers.length };
  for (const t of TABS) {
    if (t.id !== "all")
      counts[t.id] = chantiers.filter((c) => c.status === t.id).length;
  }

  const tab = TABS.some((t) => t.id === tabParam) ? (tabParam as string) : "all";
  const visible = tab === "all" ? chantiers : chantiers.filter((c) => c.status === tab);

  const kpis: Kpi[] = [
    {
      label: "Terminés",
      value: counts.termine,
      hint: "chantiers menés à bien",
      accent: "var(--ok)",
    },
    {
      label: "En cours",
      value: counts.en_cours,
      hint: "actuellement sur le terrain",
    },
    {
      label: "À planifier",
      value: counts.a_planifier,
      hint: "en attente d'une date",
      valueColor: counts.a_planifier > 0 ? "var(--warn)" : undefined,
    },
    {
      label: "Total",
      value: chantiers.length,
      hint: "chantiers dans le système",
    },
  ];

  return (
    <div>
      <div className="pro-phead">
        <div>
          <h1>Chantiers</h1>
          <div className="sub">
            {chantiers.length} chantier{chantiers.length > 1 ? "s" : ""} au
            total · {counts.a_planifier} à planifier.
          </div>
        </div>
        <Link href="/pro/chantiers/nouveau" className="pro-btn solid">
          <Plus className="h-4 w-4" /> Nouveau chantier
        </Link>
      </div>

      <Kpis items={kpis} />

      <div className="pro-tblwrap" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-tblhead">
          <div className="pro-tbltabs">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={t.id === "all" ? "/pro/chantiers" : `/pro/chantiers?tab=${t.id}`}
                className={`pro-tbltab${tab === t.id ? " active" : ""}`}
              >
                {t.label} · {counts[t.id]}
              </Link>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucun chantier.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Ville</th>
                <th>Date prévue</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <ChantierRow
                  key={String(c._id)}
                  id={String(c._id)}
                  number={c.number}
                  clientName={c.client?.name || "—"}
                  initials={initialsOf(c.client?.name || "?")}
                  title={c.title}
                  cityLabel={c.city}
                  dateLabel={
                    c.plannedDate
                      ? new Date(c.plannedDate).toLocaleDateString("fr-FR")
                      : "—"
                  }
                  status={c.status}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
