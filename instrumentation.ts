/**
 * Exécuté une fois au démarrage du serveur Next.js (`next start`, process
 * Node persistant sur le VPS) : planifie les vérifications quotidiennes
 * qui envoient les rappels par email (factures en retard, devis expirants).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = (await import("node-cron")).default;
    cron.schedule(
      "0 8 * * *",
      async () => {
        const { checkFacturesEnRetard } = await import("./lib/jobs/factures-en-retard");
        const { checkDevisExpirants } = await import("./lib/jobs/devis-expirants");
        // Chaque vérification capture ses propres erreurs : l'une ne bloque
        // jamais l'autre, et le déclenchement du lendemain a lieu normalement.
        await checkFacturesEnRetard();
        await checkDevisExpirants();
      },
      {
        name: "rappels-quotidiens",
        // 8h heure de Paris, quel que soit le fuseau du serveur (souvent UTC).
        timezone: "Europe/Paris",
        noOverlap: true, // évite un chevauchement si une exécution précédente traîne
      }
    );
  }
}
