import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectToDatabase();
  const [nouveau, enCours, traite, total, recents] = await Promise.all([
    Message.countDocuments({ status: "nouveau" }),
    Message.countDocuments({ status: "en_cours" }),
    Message.countDocuments({ status: "traite" }),
    Message.countDocuments({}),
    Message.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return { nouveau, enCours, traite, total, recents };
}

export default async function DashboardPage() {
  const { nouveau, enCours, traite, total, recents } = await getStats();

  const cards = [
    { label: "Nouvelles demandes", value: nouveau, href: "/pro/demandes?status=nouveau" },
    { label: "En cours", value: enCours, href: "/pro/demandes?status=en_cours" },
    { label: "Traitées", value: traite, href: "/pro/demandes?status=traite" },
    { label: "Total", value: total, href: "/pro/demandes" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-royal hover:shadow-sm"
          >
            <p className="text-3xl font-bold text-navy">{c.value}</p>
            <p className="mt-1 text-sm text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Dernières demandes</h2>
          <Link href="/pro/demandes" className="text-sm font-medium text-royal">
            Tout voir
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {recents.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Aucune demande pour l&apos;instant.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recents.map((m: any) => (
                  <tr key={String(m._id)} className="border-b border-slate-100 last:border-0">
                    <td className="p-3">
                      <Link href={`/pro/demandes/${m._id}`} className="font-medium text-navy hover:text-royal">
                        {m.name}
                      </Link>
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] uppercase text-slate-500">
                        {m.source}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {MESSAGE_STATUS_LABELS[m.status as keyof typeof MESSAGE_STATUS_LABELS] ?? m.status}
                    </td>
                    <td className="p-3 text-right text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
