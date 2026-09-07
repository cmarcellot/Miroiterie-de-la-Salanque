import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

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

const MessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    subject: { type: String, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    source: { type: String, enum: ["contact", "devis"], default: "contact" },
    status: { type: String, enum: MESSAGE_STATUSES, default: "nouveau" },
    adminNotes: { type: String, default: "", maxlength: 5000 },
  },
  { timestamps: true }
);

export type MessageDoc = InferSchemaType<typeof MessageSchema>;

export const Message = models.Message || model("Message", MessageSchema);

export default Message;
export { mongoose };
