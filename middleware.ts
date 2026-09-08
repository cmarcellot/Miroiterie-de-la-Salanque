import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC = ["/pro/login"];

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: "/pro/login" },
    callbacks: {
      authorized: ({ req, token }) => {
        if (PUBLIC.includes(req.nextUrl.pathname)) return true;
        return !!token;
      },
    },
  }
);

// Ne matche PAS /pro/login : le middleware d'auth n'y touche jamais.
export const config = {
  matcher: [
    "/pro",
    "/pro/((?!login).*)",
  ],
};
