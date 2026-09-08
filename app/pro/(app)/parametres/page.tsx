import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/lib/actions/settings";
import SettingsForm from "@/components/pro/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: { ok?: string };
}) {
  const settings = await getSettings();

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Configuration</div>
          <h1>Paramètres</h1>
          <div className="sub">
            Ces informations apparaissent sur les devis et factures.
          </div>
        </div>
      </div>

      <SettingsForm
        action={updateSettings}
        settings={settings}
        saved={searchParams.ok === "1"}
      />
    </div>
  );
}
