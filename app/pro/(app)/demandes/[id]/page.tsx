import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Client from "@/lib/models/Client";
import { splitName } from "@/lib/pro-enums";
import DemandeEditor from "@/components/pro/DemandeEditor";
import ClientModal from "@/components/pro/ClientModal";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = m.clientId
    ? await Client.findById(m.clientId).lean()
    : null;

  return (
    <div>
      <Link
        href="/pro/demandes"
        className="pro-lab"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--cyan)",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <div className="pro-lab">
            {new Date(m.createdAt).toLocaleString("fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            · {m.source === "devis" ? "Demande de devis" : "Message de contact"}
          </div>
          <h1>{m.name}</h1>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)",
          alignItems: "start",
        }}
        className="pro-detail-grid"
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Coordonnées</div>
            <dl
              style={{ marginTop: 12, display: "grid", gap: 6, fontSize: 13.5 }}
            >
              <Row label="Email">
                <a href={`mailto:${m.email}`} style={{ color: "var(--cyan)" }}>
                  {m.email}
                </a>
              </Row>
              {m.phone && (
                <Row label="Téléphone">
                  <a href={`tel:${m.phone}`} style={{ color: "var(--cyan)" }}>
                    {m.phone}
                  </a>
                </Row>
              )}
              {m.subject && <Row label="Sujet">{m.subject}</Row>}
            </dl>
          </div>

          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Message</div>
            <p
              style={{
                marginTop: 12,
                whiteSpace: "pre-wrap",
                fontSize: 13.5,
                color: "var(--ink-2)",
              }}
            >
              {m.message}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Client</div>
            {client ? (
              <div style={{ marginTop: 10 }}>
                <Link
                  href={`/pro/clients/${client._id}`}
                  style={{ fontWeight: 600, fontSize: 13.5 }}
                >
                  {client.name}
                </Link>
                <div
                  style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink-3)" }}
                >
                  Fiche rattachée
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-3)",
                    marginBottom: 10,
                  }}
                >
                  Aucune fiche client rattachée.
                </p>
                <ClientModal
                  fromMessage={String(m._id)}
                  prefill={{
                    ...splitName(m.name),
                    email: m.email,
                    phone: m.phone,
                  }}
                  label="Créer une fiche client"
                  variant="ghost"
                />
              </div>
            )}
          </div>

          <DemandeEditor
            id={String(m._id)}
            status={m.status}
            notes={m.adminNotes ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <dt style={{ width: 90, color: "var(--ink-3)" }}>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
