import { getSettings } from "@/lib/settings";
import { checkFacturesEnRetard } from "@/lib/jobs/factures-en-retard";
import { checkDevisExpirants } from "@/lib/jobs/devis-expirants";
import { parisNow } from "@/lib/jobs/_shared";

/** Jour (heure de Paris) du dernier passage, pour ne tourner qu'une fois par jour. */
let lastRunDay: string | null = null;

/**
 * Appelé toutes les heures par instrumentation.ts : lance les vérifications
 * quotidiennes si l'heure actuelle (Paris) est celle choisie dans
 * Paramètres > Notifications. Lire le réglage à chaque passage applique un
 * changement d'heure immédiatement, sans redémarrer le serveur. Ne lève jamais.
 */
export async function runRappelsQuotidiens() {
  const { day, hour } = parisNow();
  if (lastRunDay === day) return;

  let reminderHour: number;
  try {
    reminderHour = (await getSettings()).notifications.reminderHour;
  } catch (err) {
    console.error("runRappelsQuotidiens — lecture des paramètres", err);
    return;
  }
  if (hour !== reminderHour) return;

  lastRunDay = day;
  // Chaque vérification capture ses propres erreurs : l'une ne bloque
  // jamais l'autre, et le passage du lendemain a lieu normalement.
  await checkFacturesEnRetard();
  await checkDevisExpirants();
}
