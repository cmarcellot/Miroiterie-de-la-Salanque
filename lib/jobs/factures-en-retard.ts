import { connectToDatabase } from "@/lib/mongodb";
import Facture from "@/lib/models/Facture";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mail";
import { formatEUR, isFactureLate } from "@/lib/pro-enums";
import { baseUrl, daysFromToday, formatDate, plural } from "@/lib/jobs/_shared";

/**
 * Récapitulatif quotidien des factures en retard (Paramètres > Notifications,
 * "Facture en retard"). Un seul email listant toutes les factures en retard,
 * recalculé chaque jour à partir de l'état réel : rien n'est mémorisé, et
 * aucun email n'est envoyé s'il n'y a rien à signaler. Ne lève jamais.
 */
export async function checkFacturesEnRetard() {
  try {
    const settings = await getSettings();
    if (!settings.notifications.emailInvoiceLate) return;

    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factures = (await Facture.find({ status: "emise" })
      .sort({ dueDate: 1 })
      .lean()) as any[];
    const late = factures.filter((f) => isFactureLate(f));
    if (late.length === 0) return;

    const total = late.reduce((s, f) => s + (f.totalTTC || 0), 0);
    const lines = late.map((f) => {
      const days = -daysFromToday(f.dueDate);
      const retard = days > 0 ? `${plural(days, "jour")} de retard` : "échue aujourd'hui";
      return [
        `• ${f.number} — ${f.client?.name || "Client"}`,
        `  ${formatEUR(f.totalTTC || 0)} TTC · échéance le ${formatDate(f.dueDate)} · ${retard}`,
      ].join("\n");
    });

    const url = baseUrl();
    const text = [
      late.length > 1
        ? `${late.length} factures sont en retard de paiement (${formatEUR(total)} TTC au total) :`
        : `1 facture est en retard de paiement (${formatEUR(total)} TTC) :`,
      "",
      lines.join("\n\n"),
      ...(url ? ["", `Voir les factures en retard : ${url}/pro/factures?tab=late`] : []),
    ].join("\n");

    await sendMail({
      to: settings.company.email,
      subject:
        late.length > 1
          ? `${late.length} factures en retard — ${formatEUR(total)} TTC`
          : `1 facture en retard — ${formatEUR(total)} TTC`,
      text,
    });
    console.log(`checkFacturesEnRetard — récapitulatif envoyé (${late.length} facture(s))`);
  } catch (err) {
    console.error("checkFacturesEnRetard — email de rappel", err);
  }
}
