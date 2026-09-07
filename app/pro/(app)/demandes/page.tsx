import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Message, {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_LABELS,
  type MessageStatus,
} from "@/lib/models/Message";

export const dynamic = "force-dynamic";

const badge: Record<MessageStatus, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  en_cours: "bg-amber-100 text-amber-700",
  traite: "bg-green-100 text-green-700",
  archive: "bg-slate-100 text-slate-500",
};

export default async function DemandesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = MESSAGE_STATUSES.includes(searchParams.status as MessageStatus)
    ? (searchParams.status as MessageStatus)
    : undefined;

  await connectToDatabase();
  const messages = await Message.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Demandes</h1>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {messages.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aucune demande.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Type</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Reçue le</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m: any) => (
                <tr
                  key={String(m._id)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="p-3">
                    <Link
                      href={`/pro/demandes/${m._id}`}
                      className="font-medium text-navy hover:text-royal"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-500">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </td>
                  <td className="p-3 text-slate-500">{m.source}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        badge[m.status as MessageStatus] ?? badge.archive
                      }`}
                    >
                      {MESSAGE_STATUS_LABELS[m.status as MessageStatus] ?? m.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-royal text-white"
          : "border border-slate-300 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}
