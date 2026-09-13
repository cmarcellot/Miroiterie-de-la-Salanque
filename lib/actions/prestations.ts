"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Prestation from "@/lib/models/Prestation";
import { PRESTATION_TYPES, type PrestationType } from "@/lib/pro-enums";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function parseForm(formData: FormData) {
  const typeRaw = String(formData.get("type") || "prestation");
  const type: PrestationType = PRESTATION_TYPES.includes(
    typeRaw as PrestationType
  )
    ? (typeRaw as PrestationType)
    : "prestation";
  return {
    type,
    name: String(formData.get("name") || "").trim(),
    unit: String(formData.get("unit") || "").trim() || "unité",
    unitPrice: Number(formData.get("unitPrice")) || 0,
    vatRate: Number(formData.get("vatRate")) || 0,
    description: String(formData.get("description") || "").trim(),
  };
}

export async function createPrestation(formData: FormData) {
  await requireSession();
  const data = parseForm(formData);
  if (!data.name) throw new Error("Désignation requise.");

  await connectToDatabase();
  await Prestation.create(data);
  revalidatePath("/pro/prestations");

  if (formData.get("stay") === "1") return;
  redirect(`/pro/prestations?created=${Date.now()}`);
}

export async function updatePrestation(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  const data = parseForm(formData);
  if (!data.name) throw new Error("Désignation requise.");

  await connectToDatabase();
  await Prestation.findByIdAndUpdate(id, data);
  revalidatePath("/pro/prestations");
}

export async function setPrestationActive(id: string, active: boolean) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Prestation.findByIdAndUpdate(id, { active });
  revalidatePath("/pro/prestations");
}

export async function deletePrestation(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Prestation.findByIdAndDelete(id);
  revalidatePath("/pro/prestations");
  redirect("/pro/prestations");
}
