import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import DemandeEditor from "@/components/pro/DemandeEditor";

export const dynamic = "force-dynamic";

export default async function DemandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m: any = await Message.findById(params.id).lean();
  if (!m) notFound();

  return (
    <div>
      <Link
        href="/pro/demandes"
        className="inline-flex items-center gap-1 text-sm text-royal"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-navy">{m.name}</h1>
      <p className="text-sm text-slate-500">
        Reçue le{" "}
        {new Date(m.createdAt).toLocaleString("fr-FR", {
          dateStyle: "long",
          timeStyle: "short",
        })}{" "}
        · {m.source === "devis" ? "Demande de devis" : "Message de contact"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Coordonnées
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 text-slate-400">Email</dt>
                <dd>
                  <a href={`mailto:${m.email}`} className="text-royal">
                    {m.email}
                  </a>
                </dd>
              </div>
              {m.phone && (
                <div className="flex gap-2">
                  <dt className="w-24 text-slate-400">Téléphone</dt>
                  <dd>
                    <a href={`tel:${m.phone}`} className="text-royal">
                      {m.phone}
                    </a>
                  </dd>
                </div>
              )}
              {m.subject && (
                <div className="flex gap-2">
                  <dt className="w-24 text-slate-400">Sujet</dt>
                  <dd>{m.subject}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Message
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
              {m.message}
            </p>
          </div>
        </div>

        <DemandeEditor
          id={String(m._id)}
          status={m.status}
          notes={m.adminNotes ?? ""}
        />
      </div>
    </div>
  );
}
