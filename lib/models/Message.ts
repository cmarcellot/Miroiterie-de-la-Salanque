import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const MessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    subject: { type: String, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    source: { type: String, enum: ["contact", "devis"], default: "contact" },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type MessageDoc = InferSchemaType<typeof MessageSchema>;

export const Message =
  models.Message || model("Message", MessageSchema);

export default Message;
export { mongoose };
