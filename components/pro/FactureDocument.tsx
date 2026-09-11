import Image from "next/image";
import {
  FACTURE_STATUS_LABELS,
  formatEUR,
  isFactureLate,
  type FactureStatus,
} from "@/lib/pro-enums";
import type { AppSettings } from "@/lib/settings";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function FactureDocument({
  f,
  company,
  legal,
}: {
  f: any;
  company: AppSettings["company"];
  legal: AppSettings["legal"];
}) {
  const items: any[] = f.items ?? [];
  const vatMap = new Map<number, number>();
  let ht = 0;
  for (const it of items) {
    const line = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
    ht += line;
    const rate = Number(it.vatRate) || 0;
    vatMap.set(rate, (vatMap.get(rate) || 0) + line * (rate / 100));
  }
  const tva = f.totalTVA ?? 0;
  const ttc = f.totalTTC ?? ht + tva;
  const late = isFactureLate(f);
  const statusLabel = late
    ? "En retard de paiement"
    : FACTURE_STATUS_LABELS[f.status as FactureStatus] ?? f.status;

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
            <div className="dd-co">{company.name}</div>
            <div className="dd-co-lines">
              {company.street}
              <br />
              {company.zip} {company.city}
              <br />
              {company.phone} · {company.email}
              {legal.siret && (
                <>
                  <br />
                  SIRET {legal.siret}
                </>
              )}
              {legal.tvaIntra && (
                <>
                  <br />
                  TVA {legal.tvaIntra}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dd-meta">
          <div className="dd-title">Facture</div>
          <div className="dd-num">{f.number}</div>
          <div className="dd-meta-lines">
            Émise le{" "}
            {f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—"}
            {f.dueDate && (
              <>
                <br />
                Échéance le {new Date(f.dueDate).toLocaleDateString("fr-FR")}
              </>
            )}
            <br />
            Statut : {statusLabel}
          </div>
        </div>
      </header>

      <section className="dd-client">
        <div className="dd-label">Client</div>
        <div className="dd-client-name">{f.client?.name}</div>
        <div className="dd-client-lines">
          {f.client?.street && (
            <>
              {f.client.street}
              <br />
            </>
          )}
          {(f.client?.zip || f.client?.city) && (
            <>
              {f.client?.zip} {f.client?.city}
              <br />
            </>
          )}
          {f.client?.email}
          {f.client?.phone ? ` · ${f.client.phone}` : ""}
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
          <span>{formatEUR(f.totalHT ?? ht)}</span>
        </div>
        {Array.from(vatMap.entries())
          .filter(([rate]) => rate > 0)
          .map(([rate, amount]) => (
            <div key={rate}>
              <span>TVA {rate} %</span>
              <span>{formatEUR(amount)}</span>
            </div>
          ))}
        <div className="dd-grand">
          <span>Total TTC à payer</span>
          <span>{formatEUR(ttc)}</span>
        </div>
      </div>

      {f.notes && <div className="dd-notes">{f.notes}</div>}

      <footer className="dd-foot">
        {legal.forme && <>{legal.forme} — </>}
        {legal.rcs && <>{legal.rcs} — </>}
        {legal.ape && <>APE {legal.ape} — </>}
        {legal.assuranceDecennale && (
          <>Assurance décennale : {legal.assuranceDecennale}. </>
        )}
        Facture à régler avant la date d&apos;échéance indiquée ci-dessus.
      </footer>
    </div>
  );
}
