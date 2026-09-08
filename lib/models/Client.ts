import { Schema, models, model, InferSchemaType } from "mongoose";
import { CLIENT_TYPES } from "@/lib/pro-enums";

export {
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  type ClientType,
} from "@/lib/pro-enums";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, enum: CLIENT_TYPES, default: "particulier" },
    email: { type: String, trim: true, maxlength: 160, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    street: { type: String, trim: true, maxlength: 200, default: "" },
    zip: { type: String, trim: true, maxlength: 12, default: "" },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  { timestamps: true }
);

ClientSchema.index({ name: "text", email: "text", city: "text" });

export type ClientDoc = InferSchemaType<typeof ClientSchema>;

export const Client = models.Client || model("Client", ClientSchema);

export default Client;
