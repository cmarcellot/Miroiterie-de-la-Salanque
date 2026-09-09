import { Schema, models, model, InferSchemaType } from "mongoose";
import { DEVIS_STATUSES } from "@/lib/pro-enums";

export {
  DEVIS_STATUSES,
  DEVIS_STATUS_LABELS,
  type DevisStatus,
} from "@/lib/pro-enums";

const ItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 300 },
    qty: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, default: 0 }, // HT
    vatRate: { type: Number, default: 20 }, // %
  },
  { _id: false }
);

const ClientSnapSchema = new Schema(
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

export type DevisDoc = InferSchemaType<typeof DevisSchema>;

export const Devis = models.Devis || model("Devis", DevisSchema);

export default Devis;
