import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { CLIENT_TYPE_LABELS, type ClientType } from "@/lib/models/Client";
import { clientDisplayName } from "@/lib/pro-enums";
import ClientModal from "@/components/pro/ClientModal";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  await connectToDatabase();
  const filter = q
    ? {
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          { company: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const clientsRaw = await Client.find(filter)
    .sort({ lastName: 1, company: 1 })
    .limit(300)
    .lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = (clientsRaw as any[])
    .map((c) => ({ ...c, display: clientDisplayName(c) }))
    .sort((a, b) => a.display.localeCompare(b.display, "fr"));

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Répertoire</div>
          <h1>Clients</h1>
          <div className="sub">
            {clients.length} fiche{clients.length > 1 ? "s" : ""}
            {q ? ` pour « ${q} »` : ""}.
          </div>
        </div>
        <ClientModal />
      </div>

      <form
        method="get"
        style={{ marginBottom: 14, maxWidth: 420 }}
        className="pro-search"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un nom, une ville, un téléphone…"
        />
      </form>

      <div className="pro-card" style={{ overflowX: "auto" }}>
        {clients.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            {q ? "Aucun client trouvé." : "Aucune fiche client pour l'instant."}
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Ville</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => (
                <tr key={String(c._id)}>
                  <td>
                    <Link
                      href={`/pro/clients/${c._id}`}
                      style={{ fontWeight: 600 }}
                    >
                      {c.display}
                    </Link>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {CLIENT_TYPE_LABELS[c.type as ClientType] ?? c.type}
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>{c.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
