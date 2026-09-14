import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import {
  FACTURE_STATUS_LABELS,
  formatEUR,
  isFactureLate,
  type FactureStatus,
} from "@/lib/pro-enums";
import type { AppSettings } from "@/lib/settings";
import { styles } from "./pdfStyles";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function FacturePdfDocument({
  f,
  company,
  legal,
  logo,
}: {
  f: any;
  company: AppSettings["company"];
  legal: AppSettings["legal"];
  logo?: Buffer;
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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.top}>
          <View style={styles.head}>
            <View style={styles.emitter}>
              {logo && (
                <Image src={{ data: logo, format: "png" }} style={styles.logo} />
              )}
              <View>
                <Text style={styles.coName}>{company.name}</Text>
                <Text style={styles.coLines}>
                  {company.street}
                  {"\n"}
                  {company.zip} {company.city}
                  {"\n"}
                  {company.phone} · {company.email}
                  {legal.siret ? `\nSIRET ${legal.siret}` : ""}
                  {legal.tvaIntra ? `\nTVA ${legal.tvaIntra}` : ""}
                </Text>
              </View>
            </View>

            <View style={styles.meta}>
              <Text style={styles.title}>Facture</Text>
              <Text style={styles.num}>{f.number}</Text>
              <Text style={styles.metaLines}>
                Émise le{" "}
                {f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—"}
                {f.dueDate
                  ? `\nÉchéance le ${new Date(f.dueDate).toLocaleDateString("fr-FR")}`
                  : ""}
                {"\n"}Statut : {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.client}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.clientName}>{f.client?.name}</Text>
            <Text style={styles.clientLines}>
              {f.client?.street ? `${f.client.street}\n` : ""}
              {f.client?.zip || f.client?.city
                ? `${f.client?.zip || ""} ${f.client?.city || ""}\n`
                : ""}
              {f.client?.email}
              {f.client?.phone ? ` · ${f.client.phone}` : ""}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, styles.colLabel]}>Désignation</Text>
              <Text style={[styles.th, styles.colQty]}>Qté</Text>
              <Text style={[styles.th, styles.colPrice]}>P.U. HT</Text>
              <Text style={[styles.th, styles.colVat]}>TVA</Text>
              <Text style={[styles.th, styles.colTotal]}>Total HT</Text>
            </View>
            {items.map((it, i) => (
              <View style={styles.tr} key={i} wrap={false}>
                <Text style={[styles.td, styles.colLabel]}>{it.label}</Text>
                <Text style={[styles.td, styles.colQty]}>{it.qty}</Text>
                <Text style={[styles.td, styles.colPrice]}>
                  {formatEUR(it.unitPrice)}
                </Text>
                <Text style={[styles.td, styles.colVat]}>{it.vatRate} %</Text>
                <Text style={[styles.td, styles.colTotal]}>
                  {formatEUR((it.qty || 0) * (it.unitPrice || 0))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Total HT</Text>
              <Text>{formatEUR(f.totalHT ?? ht)}</Text>
            </View>
            {Array.from(vatMap.entries())
              .filter(([rate]) => rate > 0)
              .map(([rate, amount]) => (
                <View style={styles.totalRow} key={rate}>
                  <Text>TVA {rate} %</Text>
                  <Text>{formatEUR(amount)}</Text>
                </View>
              ))}
            <View style={styles.grandRow}>
              <Text>Total TTC à payer</Text>
              <Text>{formatEUR(ttc)}</Text>
            </View>
          </View>

          {f.notes && <Text style={styles.notes}>{f.notes}</Text>}

          {company.iban && (
            <Text style={styles.notes}>
              Coordonnées bancaires : règlement par virement à l&apos;ordre de{" "}
              {company.name}. IBAN {company.iban}.
            </Text>
          )}

          <Text style={styles.foot}>
            {legal.forme ? `${legal.forme} — ` : ""}
            {legal.rcs ? `${legal.rcs} — ` : ""}
            {legal.ape ? `APE ${legal.ape} — ` : ""}
            {legal.assuranceDecennale
              ? `Assurance décennale : ${legal.assuranceDecennale}. `
              : ""}
            Facture à régler avant la date d&apos;échéance indiquée ci-dessus.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
