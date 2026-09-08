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
    notes: string;
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
  return {
    company: {
      name: c.name || site.name,
      phone: c.phone || site.phone,
      email: c.email || site.email,
      street: c.street || site.address.street,
      zip: c.zip || site.address.zip,
      city: c.city || site.address.city,
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
      notes: v.notes || "",
    },
  };
}
