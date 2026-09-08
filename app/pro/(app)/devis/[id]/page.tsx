import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft, Printer } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import { getClientOptions } from "@/lib/clients-list";
import { updateDevis, setDevisStatus, deleteDevis } from "@/lib/actions/devis";
import DevisForm from "@/components/pro/DevisForm";
import DevisStatusBar from "@/components/pro/DevisStatusBar";
import DeleteButton from "@/components/pro/DeleteButton";

export const dynamic = "force-dynamic";

function toDateInput(d?: Date | string | null) {
  if (!d) return undefined;
  return new Date(d).toISOString().slice(0, 10);
}

export default async function DevisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Devis.findById(params.id).lean();
  if (!d) notFound();

  const clients = await getClientOptions();

  return (
    <div>
      <Link
        href="/pro/devis"
        className="pro-lab"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--cyan)",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux devis
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Devis · {d.client?.name}</div>
          <h1>{d.number}</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <DevisStatusBar
            status={d.status}
            onChange={setDevisStatus.bind(null, String(d._id))}
          />
          <Link
            href={`/pro/devis/${d._id}/imprimer`}
            className="pro-btn ghost"
            target="_blank"
          >
            <Printer className="h-4 w-4" /> PDF
          </Link>
        </div>
      </div>

      <DevisForm
        action={updateDevis.bind(null, String(d._id))}
        clients={clients}
        values={{
          clientId: String(d.clientId),
          date: toDateInput(d.date),
          validUntil: toDateInput(d.validUntil),
          depositPct: d.depositPct,
          notes: d.notes,
          items: d.items,
        }}
        lockClient
        cancelHref="/pro/devis"
        submitLabel="Enregistrer les modifications"
      />

      <div
        className="pro-card"
        style={{ marginTop: 14, padding: "16px 20px", maxWidth: 620 }}
      >
        <div className="pro-lab">Zone de danger</div>
        <p style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}>
          La suppression du devis est définitive.
        </p>
        <DeleteButton
          action={deleteDevis.bind(null, String(d._id))}
          confirmText={`Supprimer définitivement le devis ${d.number} ?`}
          label="Supprimer le devis"
        />
      </div>
    </div>
  );
}
