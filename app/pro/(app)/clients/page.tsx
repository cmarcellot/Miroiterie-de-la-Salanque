import { Search } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { CLIENT_TYPE_LABELS, type ClientType } from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import { clientDisplayName, initialsOf } from "@/lib/pro-enums";
import ClientModal from "@/components/pro/ClientModal";
import ClientRow from "@/components/pro/ClientRow";
import Toast from "@/components/pro/Toast";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim();

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

  const [clientsRaw, devisCounts] = await Promise.all([
    Client.find(filter).limit(300).lean(),
    Devis.aggregate([{ $group: { _id: "$clientId", n: { $sum: 1 } } }]),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countByClient = new Map<string, number>(
    (devisCounts as any[]).map((d) => [String(d._id), d.n as number])
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = (clientsRaw as any[])
    .map((c) => ({ ...c, display: clientDisplayName(c) }))
    .sort((a, b) => a.display.localeCompare(b.display, "fr"));

  return (
    <div>
      <Toast param="created" message="Fiche client créée." />

      <div className="pro-phead">
        <div>
          <h1>Clients</h1>
          <div className="sub">
            {clients.length} fiche{clients.length > 1 ? "s" : ""}
            {q ? ` pour « ${q} »` : " · cliquez sur une ligne pour ouvrir la fiche"}.
          </div>
        </div>
        <ClientModal label="Nouveau client" />
      </div>

      <form method="get" className="pro-search" style={{ marginBottom: 16 }}>
        <Search />
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
                <th>Ville</th>
                <th>Devis</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <ClientRow
                  key={String(c._id)}
                  id={String(c._id)}
                  initials={initialsOf(c.display)}
                  name={c.display}
                  typeLabel={CLIENT_TYPE_LABELS[c.type as ClientType] ?? c.type}
                  phone={c.phone}
                  email={c.email}
                  city={c.city}
                  devisCount={countByClient.get(String(c._id)) ?? 0}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
