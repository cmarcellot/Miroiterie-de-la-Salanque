import { Schema } from "mongoose";

/** Ligne de devis/facture — partagée entre les deux modèles. */
export const ItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 300 },
    qty: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, default: 0 }, // HT
    vatRate: { type: Number, default: 20 }, // %
  },
  { _id: false }
);

/** Photocopie des coordonnées client au moment de l'émission — partagée entre devis et factures. */
export const ClientSnapSchema = new Schema(
  {
    name: String,
    street: String,
    zip: String,
    city: String,
    email: String,
    phone: String,
  },
  { _id: false }
);
