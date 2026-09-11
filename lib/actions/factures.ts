"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Facture from "@/lib/models/Facture";
import Devis from "@/lib/models/Devis";
import Client from "@/lib/models/Client";
import { getSettings } from "@/lib/settings";
import {
  FACTURE_STATUSES,
  clientDisplayName,
  computeTotals,
  type FactureStatus,
  type LineItem,
} from "@/lib/pro-enums";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function parseItems(raw: unknown): LineItem[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((it) => ({
      label: String((it as any)?.label ?? "").trim().slice(0, 300),
      qty: Number((it as any)?.qty) || 0,
      unitPrice: Number((it as any)?.unitPrice) || 0,
      vatRate: Number((it as any)?.vatRate) || 0,
    }))
    .filter((it) => it.label.length > 0);
}

function parseForm(formData: FormData) {
  const items = parseItems(formData.get("items"));
  const totals = computeTotals(items);
  return {
    items,
    ...totals,
    date: new Date(String(formData.get("date") || "") || Date.now()),
    dueDate: formData.get("dueDate")
      ? new Date(String(formData.get("dueDate")))
      : undefined,
    notes: String(formData.get("notes") || "").trim().slice(0, 4000),
  };
}

async function nextNumber() {
  const year = new Date().getFullYear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last: any = await Facture.findOne({ year }).sort({ seq: -1 }).lean();
  const seq = (last?.seq ?? 0) + 1;
  return {
    year,
    seq,
    number: `F-${year}-${String(seq).padStart(3, "0")}`,
  };
}

export async function createFacture(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") || "");
  if (!mongoose.isValidObjectId(clientId))
    throw new Error("Client requis.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = await Client.findById(clientId).lean();
  if (!client) throw new Error("Client introuvable.");

  const { year, seq, number } = await nextNumber();
  const data = parseForm(formData);

  const doc = await Facture.create({
    number,
    year,
    seq,
    clientId,
    client: {
      name: clientDisplayName(client),
      street: client.street,
      zip: client.zip,
      city: client.city,
      email: client.email,
      phone: client.phone,
    },
    status: "emise",
    ...data,
  });

  revalidatePath("/pro/factures");
  redirect(`/pro/factures/${doc._id}`);
}

/** Génère une facture reprenant les lignes et le client d'un devis. */
export async function createFactureFromDevis(devisId: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(devisId))
    throw new Error("Identifiant invalide.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devis: any = await Devis.findById(devisId).lean();
  if (!devis) throw new Error("Devis introuvable.");

  const [{ year, seq, number }, settings] = await Promise.all([
    nextNumber(),
    getSettings(),
  ]);

  const doc = await Facture.create({
    number,
    year,
    seq,
    clientId: devis.clientId ?? null,
    client: devis.client ?? {},
    devisId: devis._id,
    date: new Date(),
    dueDate: new Date(
      Date.now() + settings.factures.paymentDelayDays * 864e5
    ),
    status: "emise",
    items: devis.items ?? [],
    totalHT: devis.totalHT ?? 0,
    totalTVA: devis.totalTVA ?? 0,
    totalTTC: devis.totalTTC ?? 0,
    notes: settings.factures.notes || devis.notes || "",
  });

  revalidatePath("/pro/factures");
  revalidatePath(`/pro/devis/${devisId}`);
  redirect(`/pro/factures/${doc._id}`);
}

export async function updateFacture(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  const data = parseForm(formData);
  await Facture.findByIdAndUpdate(id, data);

  revalidatePath("/pro/factures");
  revalidatePath(`/pro/factures/${id}`);
  redirect(`/pro/factures/${id}`);
}

export async function setFactureStatus(id: string, status: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  if (!FACTURE_STATUSES.includes(status as FactureStatus))
    throw new Error("Statut invalide.");

  await connectToDatabase();
  await Facture.findByIdAndUpdate(id, {
    status,
    paidAt: status === "payee" ? new Date() : null,
  });

  revalidatePath("/pro/factures");
  revalidatePath(`/pro/factures/${id}`);
  revalidatePath("/pro");
}

export async function deleteFacture(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Facture.findByIdAndDelete(id);
  revalidatePath("/pro/factures");
  redirect("/pro/factures");
}
