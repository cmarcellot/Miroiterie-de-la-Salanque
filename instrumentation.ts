/**
 * Exécuté une fois au démarrage du serveur Next.js (`next start`, process
 * Node persistant sur le VPS) : planifie les rappels quotidiens par email
 * (factures en retard, devis expirants). La tâche passe à chaque heure pleine
 * et n'envoie qu'à l'heure choisie dans Paramètres > Notifications.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = (await import("node-cron")).default;
    cron.schedule(
      "0 * * * *",
      async () => {
        const { runRappelsQuotidiens } = await import("./lib/jobs/rappels-quotidiens");
        await runRappelsQuotidiens();
      },
      {
        name: "rappels-quotidiens",
        // Heures pleines de Paris, quel que soit le fuseau du serveur (souvent UTC).
        timezone: "Europe/Paris",
        noOverlap: true, // évite un chevauchement si une exécution précédente traîne
      }
    );
  }
}
