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
  const typeRaw = String(formData.get("type") || "particulier");
  const type: ClientType = CLIENT_TYPES.includes(typeRaw as ClientType)
    ? (typeRaw as ClientType)
    : "particulier";
  return {
    type,
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    company:
      type === "professionnel"
        ? String(formData.get("company") || "").trim()
        : "",
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    street: String(formData.get("street") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
}

function assertValid(data: ReturnType<typeof parse>) {
  if (data.type === "professionnel" && !data.company)
    throw new Error("Raison sociale requise.");
  if (data.type !== "professionnel" && !data.lastName)
    throw new Error("Nom du client requis.");
}

export async function createClient(formData: FormData) {
  await requireSession();
  const data = parse(formData);
  assertValid(data);

  await connectToDatabase();
  const doc = await Client.create(data);
  revalidatePath("/pro/clients");

  const fromMessage = String(formData.get("fromMessage") || "");
  if (mongoose.isValidObjectId(fromMessage)) {
    await Message.findByIdAndUpdate(fromMessage, {
      clientId: doc._id,
      status: "en_cours",
    });
    revalidatePath(`/pro/demandes/${fromMessage}`);
    redirect(`/pro/demandes/${fromMessage}?created=${Date.now()}`);
  }

  // Depuis un modal (liste) : on ne redirige pas, le modal se ferme.
  if (formData.get("stay") === "1") return;

  redirect(`/pro/clients/${doc._id}?created=${Date.now()}`);
}

export async function updateClient(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");
  const data = parse(formData);
  assertValid(data);

  await connectToDatabase();
  await Client.findByIdAndUpdate(id, data);

  revalidatePath("/pro/clients");
  revalidatePath(`/pro/clients/${id}`);
  redirect(`/pro/clients/${id}?updated=${Date.now()}`);
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
