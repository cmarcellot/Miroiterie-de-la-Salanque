import type { Metadata } from "next";
import { proFontVars } from "../fonts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Client from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier from "@/lib/models/Chantier";
import { getNotifications } from "@/lib/notifications";
import Sidebar from "@/components/pro/Sidebar";
import Topbar from "@/components/pro/Topbar";
import "../pro.css";

export const metadata: Metadata = {
  title: "Espace pro",
  robots: { index: false, follow: false },
};

async function getCounts() {
  try {
    await connectToDatabase();
    const [pending, clients, devisEnAttente, facturesEnRetard, chantiersAPlanifier] =
      await Promise.all([
        Message.countDocuments({ status: "nouveau" }),
        Client.countDocuments({}),
        Devis.countDocuments({ status: { $in: ["brouillon", "envoye"] } }),
        Facture.countDocuments({
          status: "emise",
          dueDate: { $lt: new Date() },
        }),
        Chantier.countDocuments({ status: "a_planifier" }),
      ]);
    return { pending, clients, devisEnAttente, facturesEnRetard, chantiersAPlanifier };
  } catch {
    return {
      pending: 0,
      clients: 0,
      devisEnAttente: 0,
      facturesEnRetard: 0,
      chantiersAPlanifier: 0,
    };
  }
}

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, counts, notifications] = await Promise.all([
    getServerSession(authOptions),
    getCounts(),
    getNotifications().catch(() => []),
  ]);
  const { pending, clients, devisEnAttente, facturesEnRetard, chantiersAPlanifier } =
    counts;

  return (
    <div
      className={`pro-root ${proFontVars}`}
    >
      <div className="pro-aura" aria-hidden>
        <i />
        <i />
      </div>
      <div className="pro-grain" aria-hidden />

      <div className="pro-shell">
        <Sidebar
          pending={pending}
          clients={clients}
          devisEnAttente={devisEnAttente}
          facturesEnRetard={facturesEnRetard}
          chantiersAPlanifier={chantiersAPlanifier}
        />
        <div className="pro-main">
          <Topbar
            email={session?.user?.email}
            name={session?.user?.name}
            pending={pending}
            notifications={notifications}
          />
          <div className="pro-page">{children}</div>
        </div>
      </div>
    </div>
  );
}
