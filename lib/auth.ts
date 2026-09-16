import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import User from "./models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/pro/login" },
  providers: [
    Credentials({
      name: "Mot de passe",
      credentials: {
        password: { label: "Mot de passe", type: "password" },
      },
      // Compte gérant unique : pas d'email à saisir, un seul mot de passe suffit.
      async authorize(credentials) {
        if (!credentials?.password) return null;
        const password = String(credentials.password);

        try {
          await connectToDatabase();
        } catch (err) {
          console.error("[auth] connexion base impossible:", err);
          throw new Error("db_unreachable");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let user: any = await User.findOne({});

        // Amorçage du compte gérant unique depuis les variables d'environnement,
        // au premier login, si aucun utilisateur n'existe encore.
        if (!user) {
          const seedEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
          const seedPassword = process.env.ADMIN_PASSWORD;
          if (seedEmail && seedPassword) {
            user = await User.create({
              email: seedEmail,
              name: "Administrateur",
              role: "admin",
              passwordHash: await bcrypt.hash(seedPassword, 10),
            });
            console.log("[auth] compte gérant créé:", user.email);
          }
        }

        if (!user) {
          console.log("[auth] échec: aucun compte gérant configuré");
          return null;
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          email: user.email as string,
          name: (user.name as string) ?? "Administrateur",
          role: user.role as "admin" | "employe",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
