import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClientOptions } from "@/lib/clients-list";
import { getSettings } from "@/lib/settings";
import { createFacture } from "@/lib/actions/factures";
import FactureForm from "@/components/pro/FactureForm";

export const dynamic = "force-dynamic";

export default async function NewFacturePage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const [clients, settings] = await Promise.all([
    getClientOptions(),
    getSettings(),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(
    Date.now() + settings.factures.paymentDelayDays * 864e5
  )
    .toISOString()
    .slice(0, 10);

  return (
    <div>
      <Link href="/pro/factures" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Nouveau document</div>
          <h1>Nouvelle facture</h1>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="pro-empty">
          <p style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
            Ajoute d&apos;abord au moins un client.
          </p>
          <Link
            href="/pro/clients/nouveau"
            className="pro-btn solid"
            style={{ marginTop: 12 }}
          >
            Créer un client
          </Link>
        </div>
      ) : (
        <FactureForm
          action={createFacture}
          clients={clients}
          values={{
            clientId: searchParams.client,
            date: today,
            dueDate,
            notes: settings.factures.notes,
          }}
          cancelHref="/pro/factures"
          submitLabel="Créer la facture"
          defaultVatRate={settings.devis.defaultVatRate}
        />
      )}
    </div>
  );
}
