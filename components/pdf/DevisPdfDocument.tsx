import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { DEVIS_STATUS_LABELS, formatEUR, type DevisStatus } from "@/lib/pro-enums";
import type { AppSettings } from "@/lib/settings";
import { styles } from "./pdfStyles";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function DevisPdfDocument({
  d,
  company,
  legal,
  logo,
}: {
  d: any;
  company: AppSettings["company"];
  legal: AppSettings["legal"];
  logo?: Buffer;
}) {
  const items: any[] = d.items ?? [];
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
              <Text style={styles.title}>Devis</Text>
              <Text style={styles.num}>{d.number}</Text>
              <Text style={styles.metaLines}>
                Émis le{" "}
                {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}
                {d.validUntil
                  ? `\nValable jusqu'au ${new Date(d.validUntil).toLocaleDateString("fr-FR")}`
                  : ""}
                {"\n"}Statut : {DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status}
              </Text>
            </View>
          </View>

          <View style={styles.client}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.clientName}>{d.client?.name}</Text>
            <Text style={styles.clientLines}>
              {d.client?.street ? `${d.client.street}\n` : ""}
              {d.client?.zip || d.client?.city
                ? `${d.client?.zip || ""} ${d.client?.city || ""}\n`
                : ""}
              {d.client?.email}
              {d.client?.phone ? ` · ${d.client.phone}` : ""}
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
              <Text>{formatEUR(d.totalHT ?? ht)}</Text>
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
              <Text>Total TTC</Text>
              <Text>{formatEUR(ttc)}</Text>
            </View>
            {d.depositPct > 0 && (
              <View style={styles.depositRow}>
                <Text>Acompte à la commande ({d.depositPct} %)</Text>
                <Text>{formatEUR(deposit)}</Text>
              </View>
            )}
          </View>

          {d.notes && <Text style={styles.notes}>{d.notes}</Text>}

          <Text style={styles.foot}>
            {legal.forme ? `${legal.forme} — ` : ""}
            {legal.rcs ? `${legal.rcs} — ` : ""}
            {legal.ape ? `APE ${legal.ape} — ` : ""}
            {legal.assuranceDecennale
              ? `Assurance décennale : ${legal.assuranceDecennale}. `
              : ""}
            Bon pour accord (date et signature) :
          </Text>
        </View>
      </Page>
    </Document>
  );
}
