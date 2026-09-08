"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import Client from "@/lib/models/Client";
import {
  DEVIS_STATUSES,
  computeTotals,
  type DevisStatus,
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
    validUntil: formData.get("validUntil")
      ? new Date(String(formData.get("validUntil")))
      : undefined,
    depositPct: Number(formData.get("depositPct")) || 0,
    notes: String(formData.get("notes") || "").trim().slice(0, 4000),
  };
}

async function nextNumber() {
  const year = new Date().getFullYear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last: any = await Devis.findOne({ year }).sort({ seq: -1 }).lean();
  const seq = (last?.seq ?? 0) + 1;
  return {
    year,
    seq,
    number: `D-${year}-${String(seq).padStart(3, "0")}`,
  };
}

export async function createDevis(formData: FormData) {
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

  const doc = await Devis.create({
    number,
    year,
    seq,
    clientId,
    client: {
      name: client.name,
      street: client.street,
      zip: client.zip,
      city: client.city,
      email: client.email,
      phone: client.phone,
    },
    status: "brouillon",
    ...data,
  });

  revalidatePath("/pro/devis");
  redirect(`/pro/devis/${doc._id}`);
}

export async function updateDevis(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  const data = parseForm(formData);
  await Devis.findByIdAndUpdate(id, data);

  revalidatePath("/pro/devis");
  revalidatePath(`/pro/devis/${id}`);
  redirect(`/pro/devis/${id}`);
}

export async function setDevisStatus(id: string, status: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  if (!DEVIS_STATUSES.includes(status as DevisStatus))
    throw new Error("Statut invalide.");

  await connectToDatabase();
  await Devis.findByIdAndUpdate(id, { status });
  revalidatePath("/pro/devis");
  revalidatePath(`/pro/devis/${id}`);
}

export async function deleteDevis(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Devis.findByIdAndDelete(id);
  revalidatePath("/pro/devis");
  redirect("/pro/devis");
}
