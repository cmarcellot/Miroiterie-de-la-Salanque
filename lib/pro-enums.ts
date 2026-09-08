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
