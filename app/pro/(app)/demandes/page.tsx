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
  const [messages, nouveauCount] = await Promise.all([
    Message.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    Message.countDocuments({ status: "nouveau" }),
  ]);

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Boîte de réception</div>
          <h1>Demandes</h1>
          <div className="sub">
            Formulaires reçus depuis le site · {nouveauCount} nouvelle
            {nouveauCount > 1 ? "s" : ""}.
          </div>
        </div>
      </div>

      <DemandeFilters status={status} />

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
