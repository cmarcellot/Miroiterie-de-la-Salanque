import Link from "next/link";
import { Search } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Prestation from "@/lib/models/Prestation";
import Toast from "@/components/pro/Toast";
import PrestationModal from "@/components/pro/PrestationModal";
import PrestationRow from "@/components/pro/PrestationRow";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "Tous" },
  { id: "produit", label: "Produits" },
  { id: "prestation", label: "Prestations" },
  { id: "archive", label: "Archivés" },
] as const;

export default async function PrestationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab: tabParam, q: qParam } = await searchParams;
  const q = (qParam ?? "").trim();

  await connectToDatabase();
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (await Prestation.find(filter)
    .sort({ name: 1 })
    .limit(500)
    .lean()) as any[];

  const counts = {
    all: items.filter((p) => p.active).length,
    produit: items.filter((p) => p.active && p.type === "produit").length,
    prestation: items.filter((p) => p.active && p.type === "prestation")
      .length,
    archive: items.filter((p) => !p.active).length,
  };

  const tab = TABS.some((t) => t.id === tabParam) ? (tabParam as string) : "all";
  const visible =
    tab === "all"
      ? items.filter((p) => p.active)
      : tab === "archive"
        ? items.filter((p) => !p.active)
        : items.filter((p) => p.active && p.type === tab);

  return (
    <div>
      <Toast param="created" message="Article ajouté au catalogue." />

      <div className="pro-phead">
        <div>
          <h1>Produits & prestations</h1>
          <div className="sub">
            {counts.all + counts.archive} article
            {counts.all + counts.archive > 1 ? "s" : ""} au catalogue
            {q ? ` pour « ${q} »` : ""}.
          </div>
        </div>
        <PrestationModal label="Nouveau" />
      </div>

      <form method="get" className="pro-search" style={{ marginBottom: 16 }}>
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <Search />
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un produit, une prestation…"
        />
      </form>

      <div className="pro-tblwrap" style={{ overflowX: "auto" }}>
        <div className="pro-tblhead">
          <div className="pro-tbltabs">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={
                  t.id === "all"
                    ? q
                      ? `/pro/prestations?q=${encodeURIComponent(q)}`
                      : "/pro/prestations"
                    : `/pro/prestations?tab=${t.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                }
                className={`pro-tbltab${tab === t.id ? " active" : ""}`}
              >
                {t.label} · {counts[t.id]}
              </Link>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            {q ? "Aucun article trouvé." : "Aucun article pour l'instant."}
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Type</th>
                <th>Unité</th>
                <th>Prix HT</th>
                <th>TVA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <PrestationRow
                  key={String(p._id)}
                  id={String(p._id)}
                  type={p.type}
                  name={p.name}
                  unit={p.unit}
                  unitPrice={p.unitPrice || 0}
                  vatRate={p.vatRate ?? 20}
                  description={p.description}
                  active={p.active}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
