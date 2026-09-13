import { Schema, models, model, InferSchemaType } from "mongoose";
import { CHANTIER_STATUSES } from "@/lib/pro-enums";
import { ClientSnapSchema } from "@/lib/models/_shared";

export {
  CHANTIER_STATUSES,
  CHANTIER_STATUS_LABELS,
  nextChantierStatus,
  type ChantierStatus,
} from "@/lib/pro-enums";

const ChantierSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    seq: { type: Number, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    client: { type: ClientSnapSchema, default: {} },
    /** Devis d'origine, si le chantier a été créé depuis un devis accepté. */
    devisId: { type: Schema.Types.ObjectId, ref: "Devis", default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: CHANTIER_STATUSES, default: "a_planifier" },
    plannedDate: { type: Date },
    completedDate: { type: Date },
    street: { type: String, trim: true, maxlength: 200, default: "" },
    zip: { type: String, trim: true, maxlength: 12, default: "" },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    notes: { type: String, default: "", maxlength: 4000 },
  },
  { timestamps: true }
);

// Requêtes fréquentes : liste triée par n°, chantiers d'un client/devis, filtre par statut.
ChantierSchema.index({ seq: -1, year: -1 });
ChantierSchema.index({ clientId: 1 });
ChantierSchema.index({ devisId: 1 });
ChantierSchema.index({ status: 1, plannedDate: 1 });

export type ChantierDoc = InferSchemaType<typeof ChantierSchema>;

export const Chantier = models.Chantier || model("Chantier", ChantierSchema);

export default Chantier;
