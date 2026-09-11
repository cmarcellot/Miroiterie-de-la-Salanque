import { Schema, models, model, InferSchemaType } from "mongoose";
import { FACTURE_STATUSES } from "@/lib/pro-enums";
import { ItemSchema, ClientSnapSchema } from "@/lib/models/_shared";

export {
  FACTURE_STATUSES,
  FACTURE_STATUS_LABELS,
  isFactureLate,
  type FactureStatus,
} from "@/lib/pro-enums";

const FactureSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    seq: { type: Number, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    client: { type: ClientSnapSchema, default: {} },
    /** Devis d'origine, si la facture a été générée depuis un devis accepté. */
    devisId: { type: Schema.Types.ObjectId, ref: "Devis", default: null },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, enum: FACTURE_STATUSES, default: "emise" },
    paidAt: { type: Date, default: null },
    items: { type: [ItemSchema], default: [] },
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },
    notes: { type: String, default: "", maxlength: 4000 },
  },
  { timestamps: true }
);

export type FactureDoc = InferSchemaType<typeof FactureSchema>;

export const Facture = models.Facture || model("Facture", FactureSchema);

export default Facture;
