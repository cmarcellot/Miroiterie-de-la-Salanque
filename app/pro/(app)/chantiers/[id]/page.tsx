import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Chantier from "@/lib/models/Chantier";
import { getClientOptions } from "@/lib/clients-list";
import {
  updateChantier,
  setChantierStatus,
  deleteChantier,
} from "@/lib/actions/chantiers";
import ChantierForm from "@/components/pro/ChantierForm";
import ChantierStatusSelect from "@/components/pro/ChantierStatusSelect";
import DeleteButton from "@/components/pro/DeleteButton";

export const dynamic = "force-dynamic";

function toDateInput(d?: Date | string | null) {
  if (!d) return undefined;
  return new Date(d).toISOString().slice(0, 10);
}

export default async function ChantierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = await Chantier.findById(id).lean();
  if (!c) notFound();

  const clients = await getClientOptions();

  return (
    <div>
      <Link href="/pro/chantiers" className="pro-btn ghost">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Chantier · {c.client?.name}</div>
          <h1>{c.number}</h1>
          {c.devisId && (
            <div className="sub">
              Créé depuis le devis{" "}
              <Link href={`/pro/devis/${c.devisId}`}>voir le devis</Link>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ChantierStatusSelect
            status={c.status}
            onChange={setChantierStatus.bind(null, String(c._id))}
          />
          {c.clientId && (
            <Link href={`/pro/clients/${c.clientId}`} className="pro-btn ghost">
              Voir la fiche client
            </Link>
          )}
        </div>
      </div>

      <ChantierForm
        action={updateChantier.bind(null, String(c._id))}
        clients={clients}
        values={{
          clientId: String(c.clientId ?? ""),
          title: c.title,
          plannedDate: toDateInput(c.plannedDate),
          street: c.street,
          zip: c.zip,
          city: c.city,
          notes: c.notes,
        }}
        lockClient
        cancelHref="/pro/chantiers"
        submitLabel="Enregistrer les modifications"
      />

      <div
        className="pro-card"
        style={{ marginTop: 14, padding: "16px 20px", maxWidth: 620 }}
      >
        <div className="pro-lab">Zone de danger</div>
        <p style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}>
          La suppression du chantier est définitive.
        </p>
        <DeleteButton
          action={deleteChantier.bind(null, String(c._id))}
          confirmText={`Supprimer définitivement le chantier ${c.number} ?`}
          label="Supprimer le chantier"
        />
      </div>
    </div>
  );
}
