import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { site } from "@/lib/site";

export type AppSettings = {
  company: {
    name: string;
    phone: string;
    email: string;
    street: string;
    zip: string;
    city: string;
    iban: string;
  };
  legal: {
    forme: string;
    siret: string;
    rcs: string;
    ape: string;
    tvaIntra: string;
    assuranceDecennale: string;
  };
  devis: {
    validityDays: number;
    depositPct: number;
    defaultVatRate: number;
    deliveryWeeks: number;
    warranty: string;
    notes: string;
  };
  factures: {
    paymentDelayDays: number;
    notes: string;
  };
  notifications: {
    emailNewLead: boolean;
    emailQuoteSigned: boolean;
    emailInvoiceLate: boolean;
    smsReminder: boolean;
  };
};

/** Paramètres entreprise, avec repli sur lib/site.ts pour les infos de base. */
export async function getSettings(): Promise<AppSettings> {
  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Settings.findOne({ singleton: "main" }).lean();
  const c = d?.company ?? {};
  const l = d?.legal ?? {};
  const v = d?.devis ?? {};
  const f = d?.factures ?? {};
  const n = d?.notifications ?? {};
  return {
    company: {
      name: c.name || site.name,
      phone: c.phone || site.phone,
      email: c.email || site.email,
      street: c.street || site.address.street,
      zip: c.zip || site.address.zip,
      city: c.city || site.address.city,
      iban: c.iban || "",
    },
    legal: {
      forme: l.forme || "",
      siret: l.siret || "",
      rcs: l.rcs || "",
      ape: l.ape || "",
      tvaIntra: l.tvaIntra || "",
      assuranceDecennale: l.assuranceDecennale || "",
    },
    devis: {
      validityDays: Number(v.validityDays) || 90,
      depositPct: v.depositPct ?? 30,
      defaultVatRate: v.defaultVatRate ?? 20,
      deliveryWeeks: Number(v.deliveryWeeks) || 4,
      warranty: v.warranty || "10 ans (garantie décennale)",
      notes: v.notes || "",
    },
    factures: {
      paymentDelayDays: Number(f.paymentDelayDays) || 30,
      notes: f.notes || "",
    },
    notifications: {
      emailNewLead: n.emailNewLead ?? true,
      emailQuoteSigned: n.emailQuoteSigned ?? true,
      emailInvoiceLate: n.emailInvoiceLate ?? true,
      smsReminder: n.smsReminder ?? false,
    },
  };
}
