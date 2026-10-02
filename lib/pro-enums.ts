/* Constantes partagées client + serveur (sans dépendance Mongoose). */

export const MESSAGE_STATUSES = [
  "nouveau",
  "en_cours",
  "traite",
  "archive",
] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  traite: "Traité",
  archive: "Archivé",
};

export const CLIENT_TYPES = ["particulier", "professionnel"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  particulier: "Particulier",
  professionnel: "Professionnel",
};

/** Découpe un nom complet en { firstName, lastName } (best effort). */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Initiales (2 max) à partir d'un nom d'affichage, pour les avatars. */
export function initialsOf(name: string): string {
  return (name || "")
    .split(/[\s'-]+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Nom d'affichage d'un client à partir de ses champs. */
export function clientDisplayName(c: {
  type?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}): string {
  const person = [c.firstName, c.lastName]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(" ");
  const company = (c.company || "").trim();
  if (c.type === "professionnel") return company || person || "Client";
  return person || company || "Client";
}

/* ---------- Devis ---------- */

export const DEVIS_STATUSES = [
  "brouillon",
  "envoye",
  "accepte",
  "refuse",
  "expire",
] as const;
export type DevisStatus = (typeof DEVIS_STATUSES)[number];

export const DEVIS_STATUS_LABELS: Record<DevisStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

/* ---------- Factures ---------- */

export const FACTURE_STATUSES = ["emise", "payee"] as const;
export type FactureStatus = (typeof FACTURE_STATUSES)[number];

export const FACTURE_STATUS_LABELS: Record<FactureStatus, string> = {
  emise: "Émise",
  payee: "Payée",
};

/** Une facture émise (non payée) dont l'échéance est dépassée. */
export function isFactureLate(f: {
  status?: string;
  dueDate?: string | Date | null;
}): boolean {
  if (f.status !== "emise" || !f.dueDate) return false;
  return new Date(f.dueDate).getTime() < Date.now();
}

/**
 * Reste à payer d'une facture : total TTC moins l'acompte déjà versé,
 * arrondi au centime. À utiliser partout où l'on parle d'un montant à
 * encaisser (le CA encaissé, lui, reste compté sur le total TTC).
 */
export function amountDue(f: { totalTTC?: number | null; depositAmount?: number | null }): number {
  const due = (Number(f.totalTTC) || 0) - (Number(f.depositAmount) || 0);
  return Math.max(0, Math.round(due * 100) / 100);
}

/** Libellé de la ligne d'acompte sur les documents ("Acompte versé le JJ/MM/AAAA"). */
export function depositLabel(paidAt?: string | Date | null): string {
  return paidAt
    ? `Acompte versé le ${new Date(paidAt).toLocaleDateString("fr-FR")}`
    : "Acompte versé";
}

/* ---------- Chantiers ---------- */

export const CHANTIER_STATUSES = [
  "a_planifier",
  "planifie",
  "en_cours",
  "termine",
  "annule",
] as const;
export type ChantierStatus = (typeof CHANTIER_STATUSES)[number];

export const CHANTIER_STATUS_LABELS: Record<ChantierStatus, string> = {
  a_planifier: "À planifier",
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

/** Statut suivant dans le déroulé normal d'un chantier (null = déjà à son terme). */
export function nextChantierStatus(status: string): ChantierStatus | null {
  const order: ChantierStatus[] = ["a_planifier", "planifie", "en_cours", "termine"];
  const i = order.indexOf(status as ChantierStatus);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
}

/* ---------- Produits & prestations (catalogue) ---------- */

export const PRESTATION_TYPES = ["prestation", "produit"] as const;
export type PrestationType = (typeof PRESTATION_TYPES)[number];

export const PRESTATION_TYPE_LABELS: Record<PrestationType, string> = {
  prestation: "Prestation",
  produit: "Produit",
};

export const VAT_RATES = [20, 10, 5.5, 0] as const;

export type LineItem = {
  label: string;
  qty: number;
  unitPrice: number; // HT
  vatRate: number; // %
};

export function computeTotals(items: LineItem[]) {
  let totalHT = 0;
  let totalTVA = 0;
  for (const it of items) {
    const line = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
    totalHT += line;
    totalTVA += line * ((Number(it.vatRate) || 0) / 100);
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  totalHT = round(totalHT);
  totalTVA = round(totalTVA);
  return { totalHT, totalTVA, totalTTC: round(totalHT + totalTVA) };
}

export function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(n) || 0);
}

/* ---------- Mise en forme des fiches clients ---------- */

const squash = (s: string) => (s || "").trim().replace(/\s+/g, " ");

/** Prénom : majuscule initiale à chaque partie (jean-pierre → Jean-Pierre). */
export function formatFirstName(raw: string): string {
  return squash(raw)
    .toLocaleLowerCase("fr-FR")
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, c: string) =>
      sep + c.toLocaleUpperCase("fr-FR")
    );
}

/** Nom : tout en majuscules, accents conservés (Lefèvre → LEFÈVRE). */
export function formatLastName(raw: string): string {
  return squash(raw).toLocaleUpperCase("fr-FR");
}

/**
 * Normalise un téléphone au format international compact (+33612345678).
 * - Saisie nationale (0…) : considérée française.
 * - +33 / 0033 → France, +32 / 0032 → Belgique (le "0" après l'indicatif est retiré).
 * - Autre indicatif "+…" : conservé tel quel, séparateurs retirés.
 * Renvoie "" pour une saisie vide, null si le numéro ne peut pas être interprété.
 */
export function normalizePhone(raw: string): string | null {
  const s = (raw || "").trim();
  if (!s) return "";
  if (!/^[\d\s.\-/()+]+$/.test(s)) return null;

  let n = s.replace(/\(\s*0\s*\)/g, "").replace(/[\s.\-/()]/g, "");
  if (n.startsWith("00")) n = "+" + n.slice(2);
  if (n.lastIndexOf("+") > 0) return null;

  if (!n.startsWith("+")) {
    return /^0[1-9]\d{8}$/.test(n) ? "+33" + n.slice(1) : null;
  }
  if (n.startsWith("+33")) {
    const rest = n.slice(3).replace(/^0/, "");
    return /^[1-9]\d{8}$/.test(rest) ? "+33" + rest : null;
  }
  if (n.startsWith("+32")) {
    const rest = n.slice(3).replace(/^0/, "");
    return /^[1-9]\d{7,8}$/.test(rest) ? "+32" + rest : null;
  }
  return /^\+[1-9]\d{5,14}$/.test(n) ? n : null;
}

/**
 * Affichage lisible d'un téléphone : +33 6 12 34 56 78, +32 470 12 34 56.
 * Gère aussi les anciens numéros enregistrés au format 06 12 34 56 78.
 */
export function formatPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (!n) return (raw || "").trim();
  const pairs = (d: string) => d.replace(/(\d\d)(?=\d)/g, "$1 ");
  if (n.startsWith("+33")) {
    return `+33 ${n[3]} ${pairs(n.slice(4))}`;
  }
  if (n.startsWith("+32")) {
    const d = n.slice(3);
    // Mobile (4xx xx xx xx), sinon fixe : zone à 1 chiffre (2, 3, 4, 9) ou 2 chiffres.
    if (d.length === 9) return `+32 ${d.slice(0, 3)} ${pairs(d.slice(3))}`;
    if ("2349".includes(d[0])) {
      return `+32 ${d[0]} ${d.slice(1, 4)} ${pairs(d.slice(4))}`;
    }
    return `+32 ${d.slice(0, 2)} ${pairs(d.slice(2))}`;
  }
  return n;
}

/** Valeur d'un lien tel: (format compact +33…). */
export function phoneHref(raw: string): string {
  return `tel:${normalizePhone(raw) || (raw || "").replace(/\s/g, "")}`;
}

/** Phrase des coordonnées bancaires (devis/factures), ou "" si aucun IBAN renseigné. */
export function bankDetailsText(company: { name: string; iban?: string }): string {
  if (!company.iban) return "";
  return `Coordonnées bancaires : règlement par virement à l'ordre de ${company.name}. IBAN ${company.iban}.`;
}
