"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mail";
import { renderDevisPdf, renderFacturePdf } from "@/lib/pdf";

export type SendEmailResult = { ok: true } | { ok: false; error: string };

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * Next.js masque les messages d'erreur des Server Actions en production
 * ("An error occurred in the Server Components render...") — on renvoie
 * donc le message utile comme valeur normale plutôt que de le lever,
 * tout en gardant l'erreur brute dans les logs serveur pour le débogage.
 */
export async function sendDevisEmail(
  id: string,
  formData: FormData
): Promise<SendEmailResult> {
  await requireSession();
  if (!mongoose.isValidObjectId(id))
    return { ok: false, error: "Identifiant invalide." };

  const to = String(formData.get("to") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!isEmail(to))
    return { ok: false, error: "Adresse email du destinataire invalide." };
  if (!subject) return { ok: false, error: "Objet requis." };
  if (!body) return { ok: false, error: "Message vide." };

  try {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = await Devis.findById(id).lean();
    if (!d) return { ok: false, error: "Devis introuvable." };

    const settings = await getSettings();
    const pdf = await renderDevisPdf(d, settings.company, settings.legal);

    await sendMail({
      to,
      subject,
      text: body,
      replyTo: settings.company.email || undefined,
      attachments: [
        {
          filename: `${d.number}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    await Devis.findByIdAndUpdate(id, {
      emailSentAt: new Date(),
      emailSentTo: to,
      ...(d.status === "brouillon" ? { status: "envoye" } : {}),
    });

    revalidatePath("/pro/devis");
    revalidatePath(`/pro/devis/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("sendDevisEmail", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur lors de l'envoi.",
    };
  }
}

export async function sendFactureEmail(
  id: string,
  formData: FormData
): Promise<SendEmailResult> {
  await requireSession();
  if (!mongoose.isValidObjectId(id))
    return { ok: false, error: "Identifiant invalide." };

  const to = String(formData.get("to") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!isEmail(to))
    return { ok: false, error: "Adresse email du destinataire invalide." };
  if (!subject) return { ok: false, error: "Objet requis." };
  if (!body) return { ok: false, error: "Message vide." };

  try {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f: any = await Facture.findById(id).lean();
    if (!f) return { ok: false, error: "Facture introuvable." };

    const settings = await getSettings();
    const pdf = await renderFacturePdf(f, settings.company, settings.legal);

    await sendMail({
      to,
      subject,
      text: body,
      replyTo: settings.company.email || undefined,
      attachments: [
        {
          filename: `${f.number}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    await Facture.findByIdAndUpdate(id, {
      emailSentAt: new Date(),
      emailSentTo: to,
    });

    revalidatePath("/pro/factures");
    revalidatePath(`/pro/factures/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("sendFactureEmail", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur lors de l'envoi.",
    };
  }
}
