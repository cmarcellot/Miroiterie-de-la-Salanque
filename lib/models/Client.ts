import { Schema, models, model, InferSchemaType } from "mongoose";
import { CLIENT_TYPES } from "@/lib/pro-enums";

export {
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  clientDisplayName,
  type ClientType,
} from "@/lib/pro-enums";

const ClientSchema = new Schema(
  {
    type: { type: String, enum: CLIENT_TYPES, default: "particulier" },
    firstName: { type: String, trim: true, maxlength: 80, default: "" },
    lastName: { type: String, trim: true, maxlength: 80, default: "" },
    company: { type: String, trim: true, maxlength: 160, default: "" },
    // Nom d'affichage dérivé, recalculé à chaque écriture (recherche / tri / snapshots).
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, trim: true, maxlength: 160, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    street: { type: String, trim: true, maxlength: 200, default: "" },
    zip: { type: String, trim: true, maxlength: 12, default: "" },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  { timestamps: true }
);

ClientSchema.index({ name: "text", company: "text", city: "text" });

export type ClientDoc = InferSchemaType<typeof ClientSchema>;

export const Client = models.Client || model("Client", ClientSchema);

export default Client;
