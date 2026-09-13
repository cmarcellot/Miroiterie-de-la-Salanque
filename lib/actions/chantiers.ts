"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Chantier from "@/lib/models/Chantier";
import Devis from "@/lib/models/Devis";
import Client from "@/lib/models/Client";
import {
  CHANTIER_STATUSES,
  clientDisplayName,
  type ChantierStatus,
} from "@/lib/pro-enums";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function parseForm(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(),
    plannedDate: formData.get("plannedDate")
      ? new Date(String(formData.get("plannedDate")))
      : undefined,
    street: String(formData.get("street") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
}

async function nextNumber() {
  const year = new Date().getFullYear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last: any = await Chantier.findOne({ year }).sort({ seq: -1 }).lean();
  const seq = (last?.seq ?? 0) + 1;
  return {
    year,
    seq,
    number: `CH-${year}-${String(seq).padStart(3, "0")}`,
  };
}

export async function createChantier(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") || "");
  if (!mongoose.isValidObjectId(clientId)) throw new Error("Client requis.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = await Client.findById(clientId).lean();
  if (!client) throw new Error("Client introuvable.");

  const { year, seq, number } = await nextNumber();
  const data = parseForm(formData);
  if (!data.title) throw new Error("Titre du chantier requis.");

  const doc = await Chantier.create({
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
    status: "a_planifier",
    title: data.title,
    plannedDate: data.plannedDate,
    notes: data.notes,
    street: data.street || client.street || "",
    zip: data.zip || client.zip || "",
    city: data.city || client.city || "",
  });

  revalidatePath("/pro/chantiers");
  redirect(`/pro/chantiers/${doc._id}`);
}

/** Crée un chantier reprenant le client et l'adresse d'un devis (typiquement accepté). */
export async function createChantierFromDevis(devisId: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(devisId))
    throw new Error("Identifiant invalide.");

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devis: any = await Devis.findById(devisId).lean();
  if (!devis) throw new Error("Devis introuvable.");

  const { year, seq, number } = await nextNumber();

  const doc = await Chantier.create({
    number,
    year,
    seq,
    clientId: devis.clientId ?? null,
    client: devis.client ?? {},
    devisId: devis._id,
    title: devis.client?.name
      ? `Chantier ${devis.client.name}`
      : `Chantier ${devis.number}`,
    status: "a_planifier",
    street: devis.client?.street || "",
    zip: devis.client?.zip || "",
    city: devis.client?.city || "",
  });

  revalidatePath("/pro/chantiers");
  revalidatePath(`/pro/devis/${devisId}`);
  redirect(`/pro/chantiers/${doc._id}`);
}

export async function updateChantier(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  const data = parseForm(formData);
  if (!data.title) throw new Error("Titre du chantier requis.");
  await Chantier.findByIdAndUpdate(id, data);

  revalidatePath("/pro/chantiers");
  revalidatePath(`/pro/chantiers/${id}`);
  redirect(`/pro/chantiers/${id}`);
}

export async function setChantierStatus(id: string, status: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  if (!CHANTIER_STATUSES.includes(status as ChantierStatus))
    throw new Error("Statut invalide.");

  await connectToDatabase();
  await Chantier.findByIdAndUpdate(id, {
    status,
    completedDate: status === "termine" ? new Date() : null,
  });

  revalidatePath("/pro/chantiers");
  revalidatePath(`/pro/chantiers/${id}`);
  revalidatePath("/pro");
}

export async function deleteChantier(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Chantier.findByIdAndDelete(id);
  revalidatePath("/pro/chantiers");
  redirect("/pro/chantiers");
}
