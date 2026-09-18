import Link from "next/link";
import { getStatsData } from "@/lib/stats";
import { STATS_PERIODS, isStatsPeriod, periodLabel, type StatsPeriod } from "@/lib/stats-period";
import { formatEUR } from "@/lib/pro-enums";
import Kpis, { type Kpi } from "@/components/pro/Kpis";
import BarChart from "@/components/pro/BarChart";

export const dynamic = "force-dynamic";

const DEFAULT_PERIOD: StatsPeriod = "12m";

export default async function StatistiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const period: StatsPeriod = isStatsPeriod(p) ? p : DEFAULT_PERIOD;
  const { kpis, chart, devisParStatut, chantiersParStatut, topClients, situationActuelle } =
    await getStatsData(period);

  const kpiItems: Kpi[] = [
    {
      label: "CA encaissé",
      value: kpis.caEncaisse.value,
      display: formatEUR(kpis.caEncaisse.value),
      hint: kpis.caEncaisse.hint,
      hintColor: kpis.caEncaisse.hintColor,
      accent: "var(--ok)",
    },
    {
      label: "Taux de signature",
      value: kpis.tauxSignature.value,
      suffix: "%",
      hint: kpis.tauxSignature.hint,
      hintColor: kpis.tauxSignature.hintColor,
      accent: "var(--ok)",
    },
    {
      label: "Nouveaux clients",
      value: kpis.nouveauxClients.value,
      hint: kpis.nouveauxClients.hint,
      hintColor: kpis.nouveauxClients.hintColor,
    },
    {
      label: "Panier moyen (devis acceptés)",
      value: kpis.panierMoyen.value,
      display: formatEUR(kpis.panierMoyen.value),
      hint: kpis.panierMoyen.hint,
      hintColor: kpis.panierMoyen.hintColor,
    },
  ];

  const totalDevis = devisParStatut.reduce((s, d) => s + d.count, 0);
  const totalChantiers = chantiersParStatut.reduce((s, c) => s + c.count, 0);

  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">{periodLabel(period)}</div>
          <h1>Statistiques</h1>
          <div className="sub">Vue d&apos;ensemble de l&apos;activité et de la performance commerciale.</div>
        </div>
      </div>

      <div className="pro-tblwrap" style={{ marginBottom: 14 }}>
        <div className="pro-tblhead">
          <div className="pro-tbltabs">
            {STATS_PERIODS.map((opt) => (
              <Link
                key={opt.id}
                href={opt.id === DEFAULT_PERIOD ? "/pro/statistiques" : `/pro/statistiques?p=${opt.id}`}
                className={`pro-tbltab${period === opt.id ? " active" : ""}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Kpis items={kpiItems} />

      <div className="pro-card" style={{ marginTop: 14 }}>
        <div className="pro-chead">
          <h3>Évolution du CA encaissé</h3>
          <span className="pro-lab">{periodLabel(period)}</span>
        </div>
        <div style={{ padding: "16px 20px 14px" }}>
          <BarChart data={chart} height={190} color="var(--ok)" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <div className="pro-card">
          <div className="pro-chead">
            <h3>Devis par statut</h3>
            <span className="pro-lab">{totalDevis} émis</span>
          </div>
          <div style={{ padding: "4px 20px 4px" }}>
            {devisParStatut.map((d, i, arr) => (
              <StatRow
                key={d.status}
                status={`devis-${d.status}`}
                label={d.label}
                count={d.count}
                pct={d.pct}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </div>

        <div className="pro-card">
          <div className="pro-chead">
            <h3>Chantiers par statut</h3>
            <span className="pro-lab">{totalChantiers} créés</span>
          </div>
          <div style={{ padding: "4px 20px 4px" }}>
            {chantiersParStatut.map((c, i, arr) => (
              <StatRow
                key={c.status}
                status={`chantier-${c.status}`}
                label={c.label}
                count={c.count}
                pct={c.pct}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginTop: 14 }}>
        <div className="pro-card">
          <div className="pro-chead">
            <h3>Top clients</h3>
            <span className="pro-lab">CA encaissé sur la période</span>
          </div>
          {topClients.length === 0 ? (
            <p style={{ padding: "24px", color: "var(--ink-3)", fontSize: 13 }}>
              Aucun encaissement sur cette période.
            </p>
          ) : (
            <table className="pro-table">
              <tbody>
                {topClients.map((c, i) => (
                  <tr key={i}>
                    <td>
                      {c.href ? (
                        <Link href={c.href} style={{ fontWeight: 600 }}>
                          {c.name}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      )}
                    </td>
                    <td className="num" style={{ textAlign: "right" }}>
                      {formatEUR(c.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pro-card">
          <div className="pro-chead">
            <h3>Situation actuelle</h3>
            <span className="pro-lab">à ce jour</span>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: "18px 20px" }}>
            <div>
              <div className="pro-lab">Total à encaisser</div>
              <div
                style={{ fontFamily: "var(--pro-display)", fontSize: 30, color: "var(--marine)", marginTop: 6 }}
              >
                {formatEUR(situationActuelle.impayeTotal)}
              </div>
            </div>
            <div>
              <div className="pro-lab">Dont en retard</div>
              <div
                style={{
                  fontFamily: "var(--pro-display)",
                  fontSize: 30,
                  marginTop: 6,
                  color: situationActuelle.enRetardCount > 0 ? "var(--danger)" : "var(--marine)",
                }}
              >
                {formatEUR(situationActuelle.enRetardMontant)}
              </div>
              <div className="pro-lab" style={{ marginTop: 4 }}>
                {situationActuelle.enRetardCount} facture{situationActuelle.enRetardCount > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  status,
  label,
  count,
  pct,
  isLast,
}: {
  status: string;
  label: string;
  count: number;
  pct: number;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      <span className={`pro-st ${status}`} style={{ minWidth: 116 }}>
        <i />
        {label}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--bg)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--marine)" }} />
      </div>
      <span className="pro-mono" style={{ fontSize: 12, color: "var(--ink-3)", minWidth: 66, textAlign: "right" }}>
        {count} · {pct}%
      </span>
    </div>
  );
}
