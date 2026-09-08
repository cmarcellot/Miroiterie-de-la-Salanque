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
