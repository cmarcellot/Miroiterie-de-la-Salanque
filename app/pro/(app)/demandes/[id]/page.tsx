import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { Phone } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUSES, type MessageStatus } from "@/lib/models/Message";
import Client from "@/lib/models/Client";
import { clientDisplayName, splitName } from "@/lib/pro-enums";
import { deleteDemande } from "@/lib/actions/demandes";
import DemandeFilters from "@/components/pro/DemandeFilters";
import DemandeList from "@/components/pro/DemandeList";
import DemandeEditor from "@/components/pro/DemandeEditor";
import ClientModal from "@/components/pro/ClientModal";
import DeleteButton from "@/components/pro/DeleteButton";
import Toast from "@/components/pro/Toast";

export const dynamic = "force-dynamic";

export default async function DemandeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, { status: statusParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  if (!mongoose.isValidObjectId(id)) notFound();

  const status = MESSAGE_STATUSES.includes(statusParam as MessageStatus)
    ? (statusParam as MessageStatus)
    : undefined;

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [m, messages]: [any, any[]] = await Promise.all([
    Message.findById(id).lean(),
    Message.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
  ]);
  if (!m) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = m.clientId
    ? await Client.findById(m.clientId).lean()
    : null;

  return (
    <div>
      <Toast param="created" message="Fiche client créée." />

      <div className="pro-phead">
        <div>
          <div className="pro-lab">Boîte de réception</div>
          <h1>Demandes</h1>
        </div>
      </div>

      <DemandeFilters status={status} />

      <div className="pro-inbox">
        <DemandeList messages={messages} activeId={id} status={status} />

        <div className="pro-card" style={{ padding: "24px 28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 22,
              paddingBottom: 18,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <h2 style={{ fontSize: 22 }}>
                {m.subject ||
                  (m.source === "devis"
                    ? "Demande de devis"
                    : "Message de contact")}
              </h2>
              <div style={{ marginTop: 6, fontSize: 13.5, color: "var(--ink-3)" }}>
                de <strong style={{ color: "var(--ink)" }}>{m.name}</strong> ·{" "}
                {new Date(m.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="pro-btn ghost">
                  <Phone className="h-4 w-4" /> Rappeler
                </a>
              )}
              {client ? (
                <Link href={`/pro/clients/${client._id}`} className="pro-btn solid">
                  Voir la fiche · {clientDisplayName(client)}
                </Link>
              ) : (
                <ClientModal
                  fromMessage={String(m._id)}
                  prefill={{
                    ...splitName(m.name),
                    email: m.email,
                    phone: m.phone,
                    zip: m.zip,
                    city: m.city,
                  }}
                  label="Créer une fiche client"
                />
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div>
              <div className="pro-lbl">Téléphone</div>
              {m.phone ? (
                <a href={`tel:${m.phone}`} style={{ fontSize: 14 }}>
                  {m.phone}
                </a>
              ) : (
                <span style={{ color: "var(--ink-3)" }}>—</span>
              )}
            </div>
            <div>
              <div className="pro-lbl">Email</div>
              <a href={`mailto:${m.email}`} style={{ fontSize: 14 }}>
                {m.email}
              </a>
            </div>
            <div>
              <div className="pro-lbl">Ville</div>
              <div style={{ fontSize: 14 }}>
                {m.zip || m.city
                  ? [m.zip, m.city].filter(Boolean).join(" ")
                  : "—"}
              </div>
            </div>
            <div>
              <div className="pro-lbl">Origine</div>
              <div style={{ fontSize: 14 }}>
                {m.source === "devis"
                  ? "Demande de devis"
                  : "Formulaire de contact"}
              </div>
            </div>
          </div>

          <div className="pro-lbl" style={{ marginBottom: 10 }}>
            Message
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: "var(--ink-2)",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.message}
          </p>

          <div
            style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid var(--line)" }}
          >
            <DemandeEditor
              id={String(m._id)}
              status={m.status}
              notes={m.adminNotes ?? ""}
            />
          </div>

          <div
            style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}
          >
            <DeleteButton
              action={deleteDemande.bind(null, String(m._id))}
              confirmText="Supprimer définitivement cette demande ?"
              label="Supprimer la demande"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
