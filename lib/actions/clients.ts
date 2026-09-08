"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { CLIENT_TYPES, type ClientType } from "@/lib/models/Client";
import Message from "@/lib/models/Message";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

function parse(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const typeRaw = String(formData.get("type") || "particulier");
  const type: ClientType = CLIENT_TYPES.includes(typeRaw as ClientType)
    ? (typeRaw as ClientType)
    : "particulier";
  return {
    name,
    type,
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    street: String(formData.get("street") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
}

export async function createClient(formData: FormData) {
  await requireSession();
  const data = parse(formData);
  if (data.name.length < 2) throw new Error("Nom requis.");

  await connectToDatabase();
  const doc = await Client.create(data);

  const fromMessage = String(formData.get("fromMessage") || "");
  if (mongoose.isValidObjectId(fromMessage)) {
    await Message.findByIdAndUpdate(fromMessage, {
      clientId: doc._id,
      status: "en_cours",
    });
    revalidatePath(`/pro/demandes/${fromMessage}`);
  }

  revalidatePath("/pro/clients");
  redirect(`/pro/clients/${doc._id}`);
}

export async function updateClient(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  const data = parse(formData);
  if (data.name.length < 2) throw new Error("Nom requis.");

  await connectToDatabase();
  await Client.findByIdAndUpdate(id, data);

  revalidatePath("/pro/clients");
  revalidatePath(`/pro/clients/${id}`);
  redirect(`/pro/clients/${id}`);
}

export async function deleteClient(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Client.findByIdAndDelete(id);
  await Message.updateMany({ clientId: id }, { clientId: null });

  revalidatePath("/pro/clients");
  redirect("/pro/clients");
}
