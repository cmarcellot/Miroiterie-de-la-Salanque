import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClientOptions } from "@/lib/clients-list";
import { createDevis } from "@/lib/actions/devis";
import DevisForm from "@/components/pro/DevisForm";

export const dynamic = "force-dynamic";

export default async function NewDevisPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const clients = await getClientOptions();
  const today = new Date().toISOString().slice(0, 10);
  const in90 = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);

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
            validUntil: in90,
            depositPct: 30,
          }}
          cancelHref="/pro/devis"
          submitLabel="Créer le devis"
        />
      )}
    </div>
  );
}
