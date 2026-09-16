import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier from "@/lib/models/Chantier";
import { formatEUR } from "@/lib/pro-enums";

export type NotificationType = "lead" | "late" | "pending" | "signed" | "chantier";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  sub: string;
  time: string;
  href: string;
};

function shortDate(d?: Date | string | null) {
  return d
    ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    : "—";
}

/**
 * Éléments qui méritent l'attention du gérant, affichés dans la cloche de
 * la topbar — même intention que le panneau "Notifications" du proto,
 * adaptée aux entités réelles de MDS (pas de "prospects" ni d'agenda ici).
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  await connectToDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, lateInvoices, pendingQuotes, acceptedQuotes, chantiersToPlan] =
    (await Promise.all([
      Message.find({ status: "nouveau" }).sort({ createdAt: -1 }).limit(5).lean(),
      Facture.find({ status: "emise", dueDate: { $lt: new Date() } })
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
      Devis.find({ status: "envoye" }).sort({ date: -1 }).limit(5).lean(),
      Devis.find({ status: "accepte" }).sort({ date: -1 }).limit(30).lean(),
      Chantier.find({ status: "a_planifier" }).sort({ createdAt: -1 }).limit(5).lean(),
    ])) as any[][];

  let signedWithoutInvoice: typeof acceptedQuotes = [];
  if (acceptedQuotes.length > 0) {
    const ids = acceptedQuotes.map((d) => d._id);
    const linked = await Facture.find(
      { devisId: { $in: ids } },
      { devisId: 1 }
    ).lean();
    const invoicedIds = new Set(linked.map((f) => String(f.devisId)));
    signedWithoutInvoice = acceptedQuotes
      .filter((d) => !invoicedIds.has(String(d._id)))
      .slice(0, 5);
  }

  const items: NotificationItem[] = [
    ...leads.map((m) => ({
      id: `lead-${m._id}`,
      type: "lead" as const,
      title: "Nouvelle demande site",
      sub: [m.name, m.subject].filter(Boolean).join(" · "),
      time: shortDate(m.createdAt),
      href: `/pro/demandes/${m._id}`,
    })),
    ...lateInvoices.map((f) => ({
      id: `late-${f._id}`,
      type: "late" as const,
      title: "Facture en retard",
      sub: `${f.client?.name || "—"} · ${formatEUR(f.totalTTC || 0)}`,
      time: `échéance ${shortDate(f.dueDate)}`,
      href: `/pro/factures/${f._id}`,
    })),
    ...pendingQuotes.map((d) => ({
      id: `pending-${d._id}`,
      type: "pending" as const,
      title: "Devis en attente de retour",
      sub: `${d.client?.name || "—"} · ${formatEUR(d.totalTTC || 0)}`,
      time: shortDate(d.date),
      href: `/pro/devis/${d._id}`,
    })),
    ...signedWithoutInvoice.map((d) => ({
      id: `signed-${d._id}`,
      type: "signed" as const,
      title: "Devis accepté — facturer ?",
      sub: `${d.client?.name || "—"} · ${formatEUR(d.totalTTC || 0)}`,
      time: shortDate(d.date),
      href: `/pro/devis/${d._id}`,
    })),
    ...chantiersToPlan.map((c) => ({
      id: `chantier-${c._id}`,
      type: "chantier" as const,
      title: "Chantier à planifier",
      sub: [c.client?.name, c.title].filter(Boolean).join(" · "),
      time: c.plannedDate ? shortDate(c.plannedDate) : "à planifier",
      href: `/pro/chantiers/${c._id}`,
    })),
  ];

  return items;
}
