"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, X, Send, Loader2 } from "lucide-react";
import { formatEUR } from "@/lib/pro-enums";

type SendEmailResult = { ok: true } | { ok: false; error: string };

/** Garantit une chaîne affichable, même si une valeur inattendue remonte. */
function toErrorText(v: unknown): string {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.message;
  try {
    return JSON.stringify(v);
  } catch {
    return "Erreur lors de l'envoi.";
  }
}

export default function SendEmailModal({
  action,
  kind,
  to,
  number,
  companyName,
  companyPhone,
  amountTTC,
  dateInfo,
  iconOnly,
  hideTrigger,
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
  /** Rendu compact (icône seule), pour une action de ligne de tableau. */
  iconOnly?: boolean;
  /**
   * Masque le bouton déclencheur sans démonter le composant — utile
   * quand le statut qui conditionne son affichage (ex. "brouillon")
   * change juste après l'envoi : le composant reste monté, donc son
   * état interne (fenêtre ouverte, confirmation affichée) survit au
   * changement de statut au lieu d'être coupé net.
   */
  hideTrigger?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // Ne rafraîchit la page qu'à la fermeture (pas juste après l'envoi) :
  // un rafraîchissement immédiat peut changer le statut affiché par la
  // ligne qui a ouvert ce modal (ex. brouillon -> envoyé dans la liste
  // des devis) et donc démonter ce composant en plein milieu de la
  // confirmation "Email envoyé".
  function closeModal() {
    setOpen(false);
    if (sent) router.refresh();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending, sent]);

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
      {hideTrigger ? null : iconOnly ? (
        <button
          type="button"
          className="ra ra-ok"
          title="Envoyer par email"
          onClick={() => {
            setOpen(true);
            setSent(false);
            setError("");
          }}
        >
          <Mail className="h-3.5 w-3.5" />
        </button>
      ) : (
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
      )}

      {open && (
        <div
          className="pro-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !pending) closeModal();
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
              onClick={closeModal}
              aria-label="Fermer"
              className="pro-modal-close"
              disabled={pending}
            >
              <X className="h-4 w-4" />
            </button>

            {pending && (
              <div className="pro-loading-overlay">
                <Loader2
                  className="h-7 w-7 pro-spin"
                  style={{ color: "var(--marine)" }}
                />
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
                  Génération du PDF et envoi de l&apos;email en cours…
                </p>
              </div>
            )}

            <div className="pro-modal-head">
              <h2>Envoyer par email</h2>
              <p>
                {kind === "devis"
                  ? "Le devis sera joint"
                  : "La facture sera jointe"}{" "}
                en PDF.
              </p>
            </div>

            <div className="pro-modal-body">
              {sent ? (
                <div>
                  <p style={{ fontSize: 13.5, color: "var(--ok)" }}>
                    Email envoyé à {to}.
                  </p>
                  <div className="pro-cform-foot" style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="pro-btn solid"
                      onClick={closeModal}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={() => {
                    // Ne fire qu'une fois la validation HTML5 passée ; met
                    // à jour l'état AVANT que React ne diffère le rendu le
                    // temps de l'action (sinon rien ne s'affiche pendant
                    // l'attente du serveur).
                    setPending(true);
                    setError("");
                  }}
                  action={async (fd) => {
                    try {
                      const result = await action(fd);
                      if (result?.ok) {
                        setSent(true);
                      } else {
                        setError(
                          toErrorText(
                            result && "error" in result
                              ? result.error
                              : result
                          )
                        );
                      }
                    } catch (err) {
                      setError(toErrorText(err));
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
                      onClick={closeModal}
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
                      {pending ? (
                        <Loader2 className="h-4 w-4 pro-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
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
