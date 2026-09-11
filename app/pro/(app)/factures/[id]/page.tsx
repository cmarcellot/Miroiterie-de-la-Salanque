import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft, Printer } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Facture, { isFactureLate } from "@/lib/models/Facture";
import { getClientOptions } from "@/lib/clients-list";
import {
  updateFacture,
  setFactureStatus,
  deleteFacture,
} from "@/lib/actions/factures";
import FactureForm from "@/components/pro/FactureForm";
import FactureStatusSelect from "@/components/pro/FactureStatusSelect";
import DeleteButton from "@/components/pro/DeleteButton";

export const dynamic = "force-dynamic";

function toDateInput(d?: Date | string | null) {
  if (!d) return undefined;
  return new Date(d).toISOString().slice(0, 10);
}

export default async function FactureDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = await Facture.findById(params.id).lean();
  if (!f) notFound();

  const clients = await getClientOptions();
  const late = isFactureLate(f);

  return (
    <div>
      <Link href="/pro/factures" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">
            Facture · {f.client?.name}
            {late && (
              <span style={{ color: "var(--danger)" }}> · en retard</span>
            )}
          </div>
          <h1>{f.number}</h1>
          {f.devisId && (
            <div className="sub">
              Générée depuis le devis{" "}
              <Link href={`/pro/devis/${f.devisId}`}>voir le devis</Link>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <FactureStatusSelect
            status={f.status}
            onChange={setFactureStatus.bind(null, String(f._id))}
          />
          <Link
            href={`/pro/factures/${f._id}/imprimer`}
            className="pro-btn ghost"
            target="_blank"
          >
            <Printer className="h-4 w-4" /> PDF
          </Link>
        </div>
      </div>

      <FactureForm
        action={updateFacture.bind(null, String(f._id))}
        clients={clients}
        values={{
          clientId: String(f.clientId ?? ""),
          date: toDateInput(f.date),
          dueDate: toDateInput(f.dueDate),
          notes: f.notes,
          items: f.items,
        }}
        lockClient
        cancelHref="/pro/factures"
        submitLabel="Enregistrer les modifications"
      />

      <div
        className="pro-card"
        style={{ marginTop: 14, padding: "16px 20px", maxWidth: 620 }}
      >
        <div className="pro-lab">Zone de danger</div>
        <p style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}>
          La suppression de la facture est définitive.
        </p>
        <DeleteButton
          action={deleteFacture.bind(null, String(f._id))}
          confirmText={`Supprimer définitivement la facture ${f.number} ?`}
          label="Supprimer la facture"
        />
      </div>
    </div>
  );
}
