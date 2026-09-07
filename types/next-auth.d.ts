import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "employe";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "employe";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "employe";
  }
}
