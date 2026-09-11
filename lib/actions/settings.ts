"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

async function saveAndRedirect(
  patch: Record<string, unknown>,
  tab: string
) {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { singleton: "main" },
    { $set: patch },
    { upsert: true, setDefaultsOnInsert: true }
  );

  revalidatePath("/pro/parametres");
  revalidatePath("/pro/devis");
  revalidatePath("/pro/factures");
  redirect(`/pro/parametres?tab=${tab}&ok=${Date.now()}`);
}

/** Onglet « Entreprise » : coordonnées + identifiants légaux (en-tête et pied des documents). */
export async function updateCompanySettings(formData: FormData) {
  await requireSession();
  const s = (k: string) => String(formData.get(k) || "").trim();

  await saveAndRedirect(
    {
      company: {
        name: s("company.name"),
        phone: s("company.phone"),
        email: s("company.email"),
        street: s("company.street"),
        zip: s("company.zip"),
        city: s("company.city"),
        iban: s("company.iban"),
      },
      legal: {
        forme: s("legal.forme"),
        siret: s("legal.siret"),
        rcs: s("legal.rcs"),
        ape: s("legal.ape"),
        tvaIntra: s("legal.tvaIntra"),
        assuranceDecennale: s("legal.assuranceDecennale"),
      },
    },
    "company"
  );
}

/** Onglet « Devis & factures » : valeurs reprises par défaut à la création de chaque document. */
export async function updateBillingSettings(formData: FormData) {
  await requireSession();
  const s = (k: string) => String(formData.get(k) || "").trim();
  const n = (k: string, fallback: number) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) ? v : fallback;
  };

  await saveAndRedirect(
    {
      devis: {
        validityDays: n("devis.validityDays", 90),
        depositPct: n("devis.depositPct", 30),
        defaultVatRate: n("devis.defaultVatRate", 20),
        deliveryWeeks: n("devis.deliveryWeeks", 4),
        warranty: s("devis.warranty"),
        notes: s("devis.notes"),
      },
      factures: {
        paymentDelayDays: n("factures.paymentDelayDays", 30),
        notes: s("factures.notes"),
      },
    },
    "billing"
  );
}

/** Onglet « Notifications » : préférences d'alerte (envoi automatique à brancher ultérieurement). */
export async function updateNotificationSettings(formData: FormData) {
  await requireSession();
  const b = (k: string) => formData.get(k) === "on";

  await saveAndRedirect(
    {
      notifications: {
        emailNewLead: b("notifications.emailNewLead"),
        emailQuoteSigned: b("notifications.emailQuoteSigned"),
        emailInvoiceLate: b("notifications.emailInvoiceLate"),
        smsReminder: b("notifications.smsReminder"),
      },
    },
    "notifications"
  );
}
