import { Schema, models, model, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Valeurs initiales du gérant unique de ce site ; modifiables ensuite
    // dans Paramètres > Compte (voir lib/actions/settings.ts).
    firstName: { type: String, default: "Joël", trim: true },
    lastName: { type: String, default: "Marcellot", trim: true },
    role: { type: String, enum: ["admin", "employe"], default: "admin" },
    passwordHash: { type: String, required: true },
    // Ids des notifications de la cloche déjà vues (« Tout marquer comme lu »,
    // voir lib/actions/notifications.ts). Purement l'état « vu » de la cloche.
    notificationsReadIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User = models.User || model("User", UserSchema);

export default User;
