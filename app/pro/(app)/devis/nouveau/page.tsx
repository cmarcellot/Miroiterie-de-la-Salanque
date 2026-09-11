import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClientOptions } from "@/lib/clients-list";
import { getSettings } from "@/lib/settings";
import { createDevis } from "@/lib/actions/devis";
import DevisForm from "@/components/pro/DevisForm";

export const dynamic = "force-dynamic";

export default async function NewDevisPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const [clients, settings] = await Promise.all([
    getClientOptions(),
    getSettings(),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const validUntil = new Date(
    Date.now() + settings.devis.validityDays * 864e5
  )
    .toISOString()
    .slice(0, 10);

  return (
    <div>
      <Link href="/pro/devis" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Nouveau document</div>
          <h1>Nouveau devis</h1>
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
        <DevisForm
          action={createDevis}
          clients={clients}
          values={{
            clientId: searchParams.client,
            date: today,
            validUntil,
            depositPct: settings.devis.depositPct,
            notes: settings.devis.notes,
          }}
          cancelHref="/pro/devis"
          submitLabel="Créer le devis"
        />
      )}
    </div>
  );
}
