import { getSettings } from "@/lib/settings";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Message from "@/lib/models/Message";
import {
  updateCompanySettings,
  updateBillingSettings,
  updateNotificationSettings,
} from "@/lib/actions/settings";
import SettingsTabs from "@/components/pro/SettingsTabs";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectToDatabase();
  const [clients, devis, factures, demandes] = await Promise.all([
    Client.countDocuments({}),
    Devis.countDocuments({}),
    Facture.countDocuments({}),
    Message.countDocuments({}),
  ]);
  return { clients, devis, factures, demandes };
}

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [settings, stats] = await Promise.all([getSettings(), getStats()]);

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Configuration</div>
          <h1>Paramètres</h1>
          <div className="sub">
            Paramétrez votre entreprise, vos conditions et vos préférences.
          </div>
        </div>
      </div>

      <SettingsTabs
        settings={settings}
        stats={stats}
        initialTab={searchParams.tab}
        companyAction={updateCompanySettings}
        billingAction={updateBillingSettings}
        notificationsAction={updateNotificationSettings}
      />
    </div>
  );
}
