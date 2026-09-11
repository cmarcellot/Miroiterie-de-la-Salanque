"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé.");
}

export async function deleteDemande(id: string) {
  await requireSession();
  if (!mongoose.isValidObjectId(id)) throw new Error("Identifiant invalide.");

  await connectToDatabase();
  await Message.findByIdAndDelete(id);

  revalidatePath("/pro/demandes");
  redirect("/pro/demandes");
}
