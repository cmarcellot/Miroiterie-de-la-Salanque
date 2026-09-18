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
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User = models.User || model("User", UserSchema);

export default User;
