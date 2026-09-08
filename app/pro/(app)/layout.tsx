import type { Metadata } from "next";
import { Chivo, Manrope, Roboto_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Client from "@/lib/models/Client";
import Sidebar from "@/components/pro/Sidebar";
import Topbar from "@/components/pro/Topbar";
import "../pro.css";

const chivo = Chivo({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-chivo",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});
const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pro-mono",
});

export const metadata: Metadata = {
  title: "Espace pro",
  robots: { index: false, follow: false },
};

async function getCounts() {
  try {
    await connectToDatabase();
    const [pending, clients] = await Promise.all([
      Message.countDocuments({ status: "nouveau" }),
      Client.countDocuments({}),
    ]);
    return { pending, clients };
  } catch {
    return { pending: 0, clients: 0 };
  }
}

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, counts] = await Promise.all([
    getServerSession(authOptions),
    getCounts(),
  ]);
  const { pending, clients } = counts;

  return (
    <div
      className={`pro-root ${chivo.variable} ${manrope.variable} ${mono.variable}`}
    >
      <div className="pro-aura" aria-hidden>
        <i />
        <i />
      </div>
      <div className="pro-grain" aria-hidden />

      <div className="pro-shell">
        <Sidebar
          email={session?.user?.email}
          pending={pending}
          clients={clients}
        />
        <div className="pro-main">
          <Topbar
            email={session?.user?.email}
            name={session?.user?.name}
            pending={pending}
          />
          <div className="pro-page">{children}</div>
        </div>
      </div>
    </div>
  );
}
