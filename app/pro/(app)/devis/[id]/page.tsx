import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import Facture, { FACTURE_STATUS_LABELS, isFactureLate, type FactureStatus } from "@/lib/models/Facture";
import { getClientOptions } from "@/lib/clients-list";
import { getSettings } from "@/lib/settings";
import { updateDevis, setDevisStatus, deleteDevis } from "@/lib/actions/devis";
import { createFactureFromDevis } from "@/lib/actions/factures";
import { formatEUR } from "@/lib/pro-enums";
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Devis.findById(id).lean();
  if (!d) notFound();

  const [clients, factures, settings] = await Promise.all([
    getClientOptions(),
    Facture.find({ devisId: d._id }).sort({ seq: -1, year: -1 }).lean(),
    getSettings(),
  ]);

  return (
    <div>
      <Link href="/pro/devis" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
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
          <form action={createFactureFromDevis.bind(null, String(d._id))}>
            <button type="submit" className="pro-btn solid">
              <ReceiptText className="h-4 w-4" /> Créer une facture
            </button>
          </form>
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
        defaultVatRate={settings.devis.defaultVatRate}
      />

      {factures.length > 0 && (
        <div className="pro-card pro-rel" style={{ marginTop: 14, padding: "16px 20px" }}>
          <h5>Facture{factures.length > 1 ? "s" : ""} générée{factures.length > 1 ? "s" : ""}</h5>
          {factures.map((f: any) => {
            const late = isFactureLate(f);
            return (
              <Link key={String(f._id)} href={`/pro/factures/${f._id}`} className="pro-rel-item">
                <span className="nm">{f.number}</span>
                <span className={`pro-st facture-${late ? "retard" : f.status}`}>
                  <i />
                  {late
                    ? "En retard"
                    : FACTURE_STATUS_LABELS[f.status as FactureStatus] ?? f.status}
                </span>
                <span className="mt">{formatEUR(f.totalTTC || 0)}</span>
              </Link>
            );
          })}
        </div>
      )}

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
