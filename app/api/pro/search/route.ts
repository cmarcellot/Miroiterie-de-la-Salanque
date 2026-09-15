import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier, { CHANTIER_STATUS_LABELS, type ChantierStatus } from "@/lib/models/Chantier";
import Message from "@/lib/models/Message";
import Prestation, { PRESTATION_TYPE_LABELS, type PrestationType } from "@/lib/models/Prestation";
import { clientDisplayName, formatEUR } from "@/lib/pro-enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchResult = {
  type: "client" | "devis" | "facture" | "chantier" | "demande" | "prestation";
  title: string;
  subtitle: string;
  meta?: string;
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
  const [clients, devis, factures, chantiers, demandes, prestations] = (await Promise.all([
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
      .limit(4)
      .lean(),
    Devis.find({ $or: [{ number: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(4)
      .lean(),
    Facture.find({ $or: [{ number: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(4)
      .lean(),
    Chantier.find({ $or: [{ number: rx }, { title: rx }, { "client.name": rx }] })
      .sort({ seq: -1, year: -1 })
      .limit(4)
      .lean(),
    Message.find({ $or: [{ name: rx }, { subject: rx }, { email: rx }] })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Prestation.find({ active: true, name: rx }).sort({ name: 1 }).limit(3).lean(),
  ])) as any[][];

  // Montant signé par client (devis acceptés), pour l'indicateur de droite —
  // même intention que le "revenue" affiché sur les fiches du proto.
  const clientIds = clients.map((c) => c._id);
  const revenueByClient = new Map<string, number>();
  if (clientIds.length > 0) {
    const rows = await Devis.aggregate([
      { $match: { clientId: { $in: clientIds }, status: "accepte" } },
      { $group: { _id: "$clientId", total: { $sum: "$totalTTC" } } },
    ]);
    for (const row of rows) revenueByClient.set(String(row._id), row.total || 0);
  }

  const results: SearchResult[] = [
    ...clients.map((c) => {
      const since = c.createdAt ? new Date(c.createdAt).getFullYear() : null;
      const revenue = revenueByClient.get(String(c._id)) ?? 0;
      return {
        type: "client" as const,
        title: clientDisplayName(c),
        subtitle: [c.city || "—", since ? `client depuis ${since}` : null]
          .filter(Boolean)
          .join(" · "),
        meta: revenue > 0 ? formatEUR(revenue) : undefined,
        href: `/pro/clients/${c._id}`,
      };
    }),
    ...devis.map((d) => ({
      type: "devis" as const,
      title: `${d.number} · ${d.client?.name || "—"}`,
      subtitle: [
        `${(d.items || []).length} ligne${(d.items || []).length > 1 ? "s" : ""}`,
        d.date ? new Date(d.date).toLocaleDateString("fr-FR") : null,
      ]
        .filter(Boolean)
        .join(" · "),
      meta: formatEUR(d.totalTTC || 0),
      href: `/pro/devis/${d._id}`,
    })),
    ...factures.map((f) => ({
      type: "facture" as const,
      title: `${f.number} · ${f.client?.name || "—"}`,
      subtitle: f.dueDate
        ? `échéance ${new Date(f.dueDate).toLocaleDateString("fr-FR")}`
        : "—",
      meta: formatEUR(f.totalTTC || 0),
      href: `/pro/factures/${f._id}`,
    })),
    ...chantiers.map((c) => ({
      type: "chantier" as const,
      title: `${c.number} · ${c.client?.name || "—"}`,
      subtitle: [c.title, c.city].filter(Boolean).join(" · "),
      meta: CHANTIER_STATUS_LABELS[c.status as ChantierStatus] ?? c.status,
      href: `/pro/chantiers/${c._id}`,
    })),
    ...demandes.map((m) => ({
      type: "demande" as const,
      title: m.name,
      subtitle: m.subject || (m.source === "devis" ? "Demande de devis" : "Formulaire de contact"),
      meta: m.source === "devis" ? "Devis" : "Contact",
      href: `/pro/demandes/${m._id}`,
    })),
    ...prestations.map((p) => ({
      type: "prestation" as const,
      title: p.name,
      subtitle: [p.unit, PRESTATION_TYPE_LABELS[p.type as PrestationType]]
        .filter(Boolean)
        .join(" · "),
      meta: formatEUR(p.unitPrice || 0),
      href: `/pro/prestations`,
    })),
  ];

  return NextResponse.json({ results });
}
