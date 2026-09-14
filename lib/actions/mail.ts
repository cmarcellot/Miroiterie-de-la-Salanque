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

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function sendDevisEmail(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  const to = String(formData.get("to") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!isEmail(to)) throw new Error("Adresse email du destinataire invalide.");
  if (!subject) throw new Error("Objet requis.");
  if (!body) throw new Error("Message vide.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Devis.findById(id).lean();
  if (!d) throw new Error("Devis introuvable.");

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
}

export async function sendFactureEmail(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  const to = String(formData.get("to") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!isEmail(to)) throw new Error("Adresse email du destinataire invalide.");
  if (!subject) throw new Error("Objet requis.");
  if (!body) throw new Error("Message vide.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = await Facture.findById(id).lean();
  if (!f) throw new Error("Facture introuvable.");

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
}
