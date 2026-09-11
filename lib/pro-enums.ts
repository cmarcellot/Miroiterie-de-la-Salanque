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

/** Met en forme un numéro de téléphone français en paires (06 12 34 56 78). */
export function formatPhone(raw: string): string {
  const s = (raw || "").trim();
  if (!s) return "";
  let digits = s.replace(/[^\d+]/g, "");
  if (digits.startsWith("+33")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("0033")) digits = "0" + digits.slice(4);
  digits = digits.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return digits.replace(/(\d\d)(?=\d)/g, "$1 ").trim();
  }
  return s;
}
