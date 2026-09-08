import Image from "next/image";
import { site } from "@/lib/site";
import { DEVIS_STATUS_LABELS, formatEUR, type DevisStatus } from "@/lib/pro-enums";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function DevisDocument({ d }: { d: any }) {
  const items: any[] = d.items ?? [];
  // Regroupe la TVA par taux
  const vatMap = new Map<number, number>();
  let ht = 0;
  for (const it of items) {
    const line = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
    ht += line;
    const rate = Number(it.vatRate) || 0;
    vatMap.set(rate, (vatMap.get(rate) || 0) + line * (rate / 100));
  }
  const tva = d.totalTVA ?? 0;
  const ttc = d.totalTTC ?? ht + tva;
  const deposit = ((Number(d.depositPct) || 0) / 100) * ttc;

  const L = site.legal;

  return (
    <div className="devis-doc">
      <header className="dd-head">
        <div className="dd-emitter">
          <Image
            src="/logo/mds-bleu.png"
            alt=""
            width={140}
            height={140}
            className="dd-logo"
          />
          <div>
            <div className="dd-co">{site.name}</div>
            <div className="dd-co-lines">
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
              <br />
              {site.phone} · {site.email}
              {L.siret && (
                <>
                  <br />
                  SIRET {L.siret}
                </>
              )}
              {L.tvaIntra && (
                <>
                  <br />
                  TVA {L.tvaIntra}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dd-meta">
          <div className="dd-title">Devis</div>
          <div className="dd-num">{d.number}</div>
          <div className="dd-meta-lines">
            Émis le{" "}
            {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}
            {d.validUntil && (
              <>
                <br />
                Valable jusqu&apos;au{" "}
                {new Date(d.validUntil).toLocaleDateString("fr-FR")}
              </>
            )}
            <br />
            Statut :{" "}
            {DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status}
          </div>
        </div>
      </header>

      <section className="dd-client">
        <div className="dd-label">Client</div>
        <div className="dd-client-name">{d.client?.name}</div>
        <div className="dd-client-lines">
          {d.client?.street && (
            <>
              {d.client.street}
              <br />
            </>
          )}
          {(d.client?.zip || d.client?.city) && (
            <>
              {d.client?.zip} {d.client?.city}
              <br />
            </>
          )}
          {d.client?.email}
          {d.client?.phone ? ` · ${d.client.phone}` : ""}
        </div>
      </section>

      <table className="dd-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th className="r">Qté</th>
            <th className="r">P.U. HT</th>
            <th className="r">TVA</th>
            <th className="r">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td>{it.label}</td>
              <td className="r">{it.qty}</td>
              <td className="r">{formatEUR(it.unitPrice)}</td>
              <td className="r">{it.vatRate} %</td>
              <td className="r">
                {formatEUR((it.qty || 0) * (it.unitPrice || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="dd-totals">
        <div>
          <span>Total HT</span>
          <span>{formatEUR(d.totalHT ?? ht)}</span>
        </div>
        {[...vatMap.entries()]
          .filter(([rate]) => rate > 0)
          .map(([rate, amount]) => (
            <div key={rate}>
              <span>TVA {rate} %</span>
              <span>{formatEUR(amount)}</span>
            </div>
          ))}
        <div className="dd-grand">
          <span>Total TTC</span>
          <span>{formatEUR(ttc)}</span>
        </div>
        {d.depositPct > 0 && (
          <div className="dd-deposit">
            <span>Acompte à la commande ({d.depositPct} %)</span>
            <span>{formatEUR(deposit)}</span>
          </div>
        )}
      </div>

      {d.notes && <div className="dd-notes">{d.notes}</div>}

      <footer className="dd-foot">
        {L.forme && <>{L.forme} — </>}
        {L.rcs && <>{L.rcs} — </>}
        {L.ape && <>APE {L.ape} — </>}
        {L.assuranceDecennale && <>Assurance décennale : {L.assuranceDecennale}. </>}
        Bon pour accord (date et signature) :
      </footer>
    </div>
  );
}
