"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, X, Send } from "lucide-react";
import { formatEUR } from "@/lib/pro-enums";

type SendEmailResult = { ok: true } | { ok: false; error: string };

export default function SendEmailModal({
  action,
  kind,
  to,
  number,
  companyName,
  companyPhone,
  amountTTC,
  dateInfo,
}: {
  action: (formData: FormData) => Promise<SendEmailResult>;
  kind: "devis" | "facture";
  to: string;
  number: string;
  companyName: string;
  companyPhone: string;
  amountTTC: number;
  /** ex. "valable jusqu'au 12/06/2026" ou "à régler avant le 12/06/2026" */
  dateInfo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, pending]);

  const defaultSubject = `Votre ${kind === "devis" ? "devis" : "facture"} ${number} — ${companyName}`;
  const defaultBody = useMemo(() => {
    const piece = kind === "devis" ? "devis" : "facture";
    const attached = kind === "devis" ? "ci-joint votre devis" : "ci-jointe votre facture";
    return `Bonjour,

Veuillez trouver ${attached} ${number} d'un montant de ${formatEUR(amountTTC)} TTC${dateInfo ? `, ${dateInfo}` : ""}.

N'hésitez pas à me contacter pour toute question au sujet de ce ${piece}.

Cordialement,
${companyName}
${companyPhone}`;
  }, [kind, number, amountTTC, dateInfo, companyName, companyPhone]);

  return (
    <>
      <button
        type="button"
        className="pro-btn ghost"
        onClick={() => {
          setOpen(true);
          setSent(false);
          setError("");
        }}
      >
        <Mail className="h-4 w-4" /> Envoyer par email
      </button>

      {open && (
        <div
          className="pro-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div
            className="pro-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Envoyer par email"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="pro-modal-close"
              disabled={pending}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pro-modal-head">
              <h2>Envoyer par email</h2>
              <p>
                Le {kind === "devis" ? "devis" : "la facture"} sera joint en
                PDF. Relisez le message et modifiez-le si besoin avant l&apos;envoi.
              </p>
            </div>

            <div className="pro-modal-body">
              {sent ? (
                <p style={{ fontSize: 13.5, color: "var(--ok)" }}>
                  Email envoyé à {to}.
                </p>
              ) : (
                <form
                  action={async (fd) => {
                    setPending(true);
                    setError("");
                    try {
                      const result = await action(fd);
                      if (result.ok) {
                        setSent(true);
                        router.refresh();
                      } else {
                        setError(result.error);
                      }
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Erreur lors de l'envoi."
                      );
                    } finally {
                      setPending(false);
                    }
                  }}
                  className="pro-cform"
                >
                  <div>
                    <label className="pro-lbl">Destinataire *</label>
                    <input
                      type="email"
                      name="to"
                      required
                      defaultValue={to}
                      className="pro-field"
                    />
                  </div>
                  <div>
                    <label className="pro-lbl">Objet *</label>
                    <input
                      name="subject"
                      required
                      defaultValue={defaultSubject}
                      className="pro-field"
                    />
                  </div>
                  <div>
                    <label className="pro-lbl">Message *</label>
                    <textarea
                      name="body"
                      required
                      rows={10}
                      defaultValue={defaultBody}
                      className="pro-field"
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {error && (
                    <p style={{ fontSize: 12.5, color: "var(--danger)" }}>
                      {error}
                    </p>
                  )}

                  <div className="pro-cform-foot">
                    <button
                      type="button"
                      className="pro-btn ghost"
                      onClick={() => setOpen(false)}
                      disabled={pending}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="pro-btn solid"
                      style={{ opacity: pending ? 0.6 : 1 }}
                    >
                      <Send className="h-4 w-4" />
                      {pending ? "Envoi…" : "Envoyer"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
