import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUSES, type MessageStatus } from "@/lib/models/Message";
import DemandeFilters from "@/components/pro/DemandeFilters";
import DemandeList from "@/components/pro/DemandeList";

export const dynamic = "force-dynamic";

export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = MESSAGE_STATUSES.includes(statusParam as MessageStatus)
    ? (statusParam as MessageStatus)
    : undefined;

  await connectToDatabase();
  const [messages, countsAgg] = await Promise.all([
    Message.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    Message.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const counts: Record<string, number> = { all: 0 };
  for (const s of MESSAGE_STATUSES) counts[s] = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of countsAgg as any[]) {
    counts[row._id] = row.n;
    counts.all += row.n;
  }

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Boîte de réception</div>
          <h1>Demandes</h1>
          <div className="sub">
            Formulaires reçus depuis le site · {counts.nouveau ?? 0} nouvelle
            {(counts.nouveau ?? 0) > 1 ? "s" : ""}.
          </div>
        </div>
      </div>

      <DemandeFilters status={status} counts={counts} />

      <div className="pro-inbox">
        <DemandeList messages={messages} status={status} />
        <div
          className="pro-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            padding: 40,
            textAlign: "center",
            color: "var(--ink-3)",
            fontSize: 13.5,
          }}
        >
          Sélectionnez une demande pour la consulter.
        </div>
      </div>
    </div>
  );
}
