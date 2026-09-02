import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { name, email, phone, subject, message, source, company } = body;

  // Honeypot anti-spam : le champ "company" doit rester vide
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length < 5) {
    return NextResponse.json({ error: "Message trop court." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await Message.create({
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
      subject: typeof subject === "string" ? subject.trim() : undefined,
      message: message.trim(),
      source: source === "devis" ? "devis" : "contact",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/contact", err);
    return NextResponse.json(
      { error: "Erreur serveur, réessayez plus tard." },
      { status: 500 }
    );
  }
}
