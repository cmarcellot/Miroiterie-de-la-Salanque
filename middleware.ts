import { withAuth } from "next-auth/middleware";

// Protège tout l'espace pro. next-auth laisse passer la page de connexion.
export default withAuth({
  pages: { signIn: "/pro/login" },
});

export const config = {
  matcher: ["/pro/:path*"],
};
