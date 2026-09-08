"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

export async function updateSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");

  const s = (k: string) => String(formData.get(k) || "").trim();
  const n = (k: string, fallback: number) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) ? v : fallback;
  };

  const data = {
    company: {
      name: s("company.name"),
      phone: s("company.phone"),
      email: s("company.email"),
      street: s("company.street"),
      zip: s("company.zip"),
      city: s("company.city"),
    },
    legal: {
      forme: s("legal.forme"),
      siret: s("legal.siret"),
      rcs: s("legal.rcs"),
      ape: s("legal.ape"),
      tvaIntra: s("legal.tvaIntra"),
      assuranceDecennale: s("legal.assuranceDecennale"),
    },
    devis: {
      validityDays: n("devis.validityDays", 90),
      depositPct: n("devis.depositPct", 30),
      notes: s("devis.notes"),
    },
  };

  await connectToDatabase();
  await Settings.findOneAndUpdate({ singleton: "main" }, data, {
    upsert: true,
    setDefaultsOnInsert: true,
  });

  revalidatePath("/pro/parametres");
  revalidatePath("/pro/devis");
  redirect(`/pro/parametres?ok=${Date.now()}`);
}
