/* Utilitaires communs aux vérifications quotidiennes (lib/jobs/*). */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Écart en jours calendaires entre aujourd'hui et `d` (positif = futur,
 * négatif = passé). Les dates d'échéance/validité sont saisies en
 * "AAAA-MM-JJ" et donc stockées à minuit UTC : on compare en jours UTC.
 */
export function daysFromToday(d: Date | string): number {
  const day = (t: number) => Math.floor(t / DAY_MS);
  return day(new Date(d).getTime()) - day(Date.now());
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n > 1 ? "s" : ""}`;
}

/** URL publique de l'espace pro (même source que l'email "nouvelle demande"). */
export function baseUrl(): string | undefined {
  return process.env.NEXTAUTH_URL?.replace(/\/+$/, "");
}
