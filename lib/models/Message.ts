import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";
import { MESSAGE_STATUSES } from "@/lib/pro-enums";

export {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_LABELS,
  type MessageStatus,
} from "@/lib/pro-enums";

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
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
  },
  { timestamps: true }
);

export type MessageDoc = InferSchemaType<typeof MessageSchema>;

export const Message = models.Message || model("Message", MessageSchema);

export default Message;
export { mongoose };
