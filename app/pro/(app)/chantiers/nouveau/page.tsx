import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClientOptions } from "@/lib/clients-list";
import { createChantier } from "@/lib/actions/chantiers";
import ChantierForm from "@/components/pro/ChantierForm";

export const dynamic = "force-dynamic";

export default async function NewChantierPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const clients = await getClientOptions();

  return (
    <div>
      <Link href="/pro/chantiers" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Nouveau document</div>
          <h1>Nouveau chantier</h1>
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
        <ChantierForm
          action={createChantier}
          clients={clients}
          values={{ clientId: client }}
          cancelHref="/pro/chantiers"
          submitLabel="Créer le chantier"
        />
      )}
    </div>
  );
}
