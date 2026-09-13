import { Schema, models, model, InferSchemaType } from "mongoose";
import { PRESTATION_TYPES } from "@/lib/pro-enums";

export {
  PRESTATION_TYPES,
  PRESTATION_TYPE_LABELS,
  type PrestationType,
} from "@/lib/pro-enums";

const PrestationSchema = new Schema(
  {
    type: { type: String, enum: PRESTATION_TYPES, default: "prestation" },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    unit: { type: String, trim: true, maxlength: 20, default: "unité" },
    unitPrice: { type: Number, default: 0 },
    vatRate: { type: Number, default: 20 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Requêtes fréquentes : liste alphabétique, filtre par type/actif, autocomplétion catalogue.
PrestationSchema.index({ name: 1 });
PrestationSchema.index({ type: 1, active: 1 });

export type PrestationDoc = InferSchemaType<typeof PrestationSchema>;

export const Prestation =
  models.Prestation || model("Prestation", PrestationSchema);

export default Prestation;
