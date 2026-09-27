import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mail";
import { formatEUR } from "@/lib/pro-enums";
import { baseUrl, daysFromToday, formatDate, plural } from "@/lib/jobs/_shared";

const REMIND_WITHIN_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Rappel des devis envoyés sans réponse dont la date de validité approche
 * (moins de 3 jours) ou est déjà dépassée (Paramètres > Notifications,
 * "Devis sur le point d'expirer"). Un email par devis, une seule fois :
 * `expiryReminderSentAt` est posé après un envoi réussi. Ne lève jamais.
 */
export async function checkDevisExpirants() {
  try {
    const settings = await getSettings();
    if (!settings.notifications.emailQuoteExpiring) return;

    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devis = (await Devis.find({
      status: "envoye",
      validUntil: { $lt: new Date(Date.now() + REMIND_WITHIN_MS) },
      expiryReminderSentAt: null,
    })
      .sort({ validUntil: 1 })
      .lean()) as any[];

    const url = baseUrl();
    for (const d of devis) {
      try {
        const days = daysFromToday(d.validUntil);
        const echeance =
          days > 0
            ? `expire dans ${plural(days, "jour")}`
            : days === 0
              ? "expire aujourd'hui"
              : `a expiré il y a ${plural(-days, "jour")}`;
        const client = d.client?.name || "Client";

        const text = [
          `Le devis ${d.number} envoyé à ${client} ${echeance}, sans réponse du client pour l'instant.`,
          "",
          `Client : ${client}${d.client?.email ? ` (${d.client.email})` : ""}`,
          `Montant : ${formatEUR(d.totalTTC || 0)} TTC`,
          `Valable jusqu'au : ${formatDate(d.validUntil)}`,
          ...(url ? ["", `Voir le devis : ${url}/pro/devis/${d._id}`] : []),
        ].join("\n");

        await sendMail({
          to: settings.company.email,
          subject: `Devis ${d.number} — ${client} : ${echeance}`,
          text,
        });
        await Devis.updateOne(
          { _id: d._id },
          { $set: { expiryReminderSentAt: new Date() } }
        );
        console.log(`checkDevisExpirants — rappel envoyé pour ${d.number}`);
      } catch (err) {
        console.error(`checkDevisExpirants — email de rappel ${d.number}`, err);
      }
    }
  } catch (err) {
    console.error("checkDevisExpirants", err);
  }
}
