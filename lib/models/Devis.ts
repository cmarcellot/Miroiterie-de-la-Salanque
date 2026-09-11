import { Schema, models, model, InferSchemaType } from "mongoose";
import { DEVIS_STATUSES } from "@/lib/pro-enums";
import { ItemSchema, ClientSnapSchema } from "@/lib/models/_shared";

export {
  DEVIS_STATUSES,
  DEVIS_STATUS_LABELS,
  type DevisStatus,
} from "@/lib/pro-enums";

const DevisSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    seq: { type: Number, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    client: { type: ClientSnapSchema, default: {} },
    date: { type: Date, default: Date.now },
    validUntil: { type: Date },
    status: { type: String, enum: DEVIS_STATUSES, default: "brouillon" },
    items: { type: [ItemSchema], default: [] },
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },
    depositPct: { type: Number, default: 30 },
    notes: { type: String, default: "", maxlength: 4000 },
  },
  { timestamps: true }
);

// Requêtes fréquentes : liste triée par n°, devis d'un client, filtre par statut.
DevisSchema.index({ seq: -1, year: -1 });
DevisSchema.index({ clientId: 1 });
DevisSchema.index({ status: 1 });

export type DevisDoc = InferSchemaType<typeof DevisSchema>;

export const Devis = models.Devis || model("Devis", DevisSchema);

export default Devis;
