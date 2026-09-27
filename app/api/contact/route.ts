import { NextResponse, after } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type NewLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  zip?: string;
  city?: string;
  message: string;
  source: "devis" | "contact";
};

/**
 * Prévient l'entreprise d'une nouvelle demande (Paramètres > Notifications,
 * "Nouvelle demande via le site"). Ne lève jamais : la demande est déjà
 * enregistrée, un échec d'envoi (SMTP non configuré, serveur injoignable…)
 * est seulement journalisé.
 */
async function notifyNewLead(lead: NewLead) {
  try {
    const settings = await getSettings();
    if (!settings.notifications.emailNewLead) return;

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/+$/, "");
    const place = [lead.zip, lead.city].filter(Boolean).join(" ");
    const details = [
      `Nom : ${lead.name}`,
      `Email : ${lead.email}`,
      lead.phone && `Téléphone : ${lead.phone}`,
      place && `Ville : ${place}`,
      lead.subject && `Objet : ${lead.subject}`,
    ].filter(Boolean);

    const text = [
      `Nouvelle demande (${lead.source}) reçue via le site.`,
      "",
      ...details,
      "",
      "Message :",
      lead.message,
      ...(baseUrl
        ? ["", `Voir la demande : ${baseUrl}/pro/demandes/${lead.id}`]
        : []),
    ].join("\n");

    await sendMail({
      to: settings.company.email,
      replyTo: lead.email,
      subject: `Nouvelle demande (${lead.source}) — ${lead.name}`,
      text,
    });
  } catch (err) {
    console.error("POST /api/contact — email de notification", err);
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { name, email, phone, subject, message, source, company, zip, city } =
    body;

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
    const lead: Omit<NewLead, "id"> = {
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
      subject: typeof subject === "string" ? subject.trim() : undefined,
      zip: typeof zip === "string" ? zip.trim() : undefined,
      city: typeof city === "string" ? city.trim() : undefined,
      message: message.trim(),
      source: source === "devis" ? "devis" : "contact",
    };
    const doc = await Message.create(lead);
    // Envoyé après la réponse : le visiteur n'attend pas le serveur SMTP.
    after(() => notifyNewLead({ ...lead, id: String(doc._id) }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/contact", err);
    return NextResponse.json(
      { error: "Erreur serveur, réessayez plus tard." },
      { status: 500 }
    );
  }
}
