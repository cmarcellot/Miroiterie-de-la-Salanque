import { Schema, models, model, InferSchemaType } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    street: { type: String, default: "" },
    zip: { type: String, default: "" },
    city: { type: String, default: "" },
  },
  { _id: false }
);

const LegalSchema = new Schema(
  {
    forme: { type: String, default: "" },
    siret: { type: String, default: "" },
    rcs: { type: String, default: "" },
    ape: { type: String, default: "" },
    tvaIntra: { type: String, default: "" },
    assuranceDecennale: { type: String, default: "" },
  },
  { _id: false }
);

const DevisDefaultsSchema = new Schema(
  {
    validityDays: { type: Number, default: 90 },
    depositPct: { type: Number, default: 30 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const FactureDefaultsSchema = new Schema(
  {
    paymentDelayDays: { type: Number, default: 30 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    company: { type: CompanySchema, default: () => ({}) },
    legal: { type: LegalSchema, default: () => ({}) },
    devis: { type: DevisDefaultsSchema, default: () => ({}) },
    factures: { type: FactureDefaultsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;

export const Settings =
  models.Settings || model("Settings", SettingsSchema);

export default Settings;
