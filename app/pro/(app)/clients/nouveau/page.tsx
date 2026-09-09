import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import { splitName } from "@/lib/pro-enums";
import { createClient } from "@/lib/actions/clients";
import ClientForm, { type ClientValues } from "@/components/pro/ClientForm";

export const dynamic = "force-dynamic";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: { fromMessage?: string };
}) {
  const fromMessage = searchParams.fromMessage;
  let values: ClientValues = {};

  if (fromMessage && mongoose.isValidObjectId(fromMessage)) {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m: any = await Message.findById(fromMessage).lean();
    if (!m) notFound();
    values = {
      ...splitName(m.name),
      email: m.email,
      phone: m.phone,
      notes: m.subject ? `Demande initiale : ${m.subject}\n\n${m.message}` : m.message,
    };
  }

  return (
    <div>
      <Link
        href={fromMessage ? `/pro/demandes/${fromMessage}` : "/pro/clients"}
        className="pro-lab"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--cyan)",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">Nouvelle fiche</div>
          <h1>Ajouter un client</h1>
        </div>
      </div>

      <ClientForm
        action={createClient}
        values={values}
        fromMessage={fromMessage}
        cancelHref={fromMessage ? `/pro/demandes/${fromMessage}` : "/pro/clients"}
        submitLabel="Créer la fiche"
      />
    </div>
  );
}
