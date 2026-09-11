import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message, { MESSAGE_STATUSES } from "@/lib/models/Message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!MESSAGE_STATUSES.includes(body.status as (typeof MESSAGE_STATUSES)[number])) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.adminNotes === "string") {
    update.adminNotes = body.adminNotes.slice(0, 5000);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await Message.findByIdAndUpdate(id, update, { new: true });
  if (!doc) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
