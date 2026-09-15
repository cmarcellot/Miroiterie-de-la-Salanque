import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier from "@/lib/models/Chantier";
import Message from "@/lib/models/Message";
import { clientDisplayName } from "@/lib/pro-enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchResult = {
  type: "client" | "devis" | "facture" | "chantier" | "demande";
  label: string;
  sublabel: string;
  href: string;
};

/** Échappe les caractères spéciaux d'une regex (recherche utilisateur = texte brut, pas une regex). */
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  await connectToDatabase();
  const rx = { $regex: escapeRegExp(q), $options: "i" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clients, devis, factures, chantiers, demandes] = (await Promise.all([
    Client.find({
      $or: [
        { firstName: rx },
        { lastName: rx },
        { company: rx },
        { email: rx },
        { phone: rx },
        { city: rx },
      ],
    })
      .limit(5)
      .lean(),
    Devis.find({ $or: [{ number: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(5)
      .lean(),
    Facture.find({ $or: [{ number: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(5)
      .lean(),
    Chantier.find({ $or: [{ number: rx }, { title: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(5)
      .lean(),
    Message.find({ $or: [{ name: rx }, { subject: rx }, { email: rx }] })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])) as any[][];

  const results: SearchResult[] = [
    ...clients.map((c) => ({
      type: "client" as const,
      label: clientDisplayName(c),
      sublabel: [c.city, c.phone].filter(Boolean).join(" · "),
      href: `/pro/clients/${c._id}`,
    })),
    ...devis.map((d) => ({
      type: "devis" as const,
      label: d.number,
      sublabel: d.client?.name || "",
      href: `/pro/devis/${d._id}`,
    })),
    ...factures.map((f) => ({
      type: "facture" as const,
      label: f.number,
      sublabel: f.client?.name || "",
      href: `/pro/factures/${f._id}`,
    })),
    ...chantiers.map((c) => ({
      type: "chantier" as const,
      label: c.number,
      sublabel: [c.title, c.client?.name].filter(Boolean).join(" · "),
      href: `/pro/chantiers/${c._id}`,
    })),
    ...demandes.map((m) => ({
      type: "demande" as const,
      label: m.subject || m.name,
      sublabel: m.subject ? m.name : m.email || "",
      href: `/pro/demandes/${m._id}`,
    })),
  ];

  return NextResponse.json({ results });
}
