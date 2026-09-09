import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Client from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import Sidebar from "@/components/pro/Sidebar";
import Topbar from "@/components/pro/Topbar";
import "../pro.css";

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Espace pro",
  robots: { index: false, follow: false },
};

async function getCounts() {
  try {
    await connectToDatabase();
    const [pending, clients, devisEnAttente] = await Promise.all([
      Message.countDocuments({ status: "nouveau" }),
      Client.countDocuments({}),
      Devis.countDocuments({ status: { $in: ["brouillon", "envoye"] } }),
    ]);
    return { pending, clients, devisEnAttente };
  } catch {
    return { pending: 0, clients: 0, devisEnAttente: 0 };
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
  const { pending, clients, devisEnAttente } = counts;

  return (
    <div
      className={`pro-root ${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}
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
          devisEnAttente={devisEnAttente}
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
