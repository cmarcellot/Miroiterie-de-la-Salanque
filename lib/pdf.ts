import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import PDFDocument from "pdfkit";
import {
  formatEUR,
  DEVIS_STATUS_LABELS,
  FACTURE_STATUS_LABELS,
  isFactureLate,
  type DevisStatus,
  type FactureStatus,
} from "@/lib/pro-enums";
import type { AppSettings } from "@/lib/settings";

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAVY = "#1d3f6b";
const INK = "#1a2330";
const MUTED = "#5a6675";
const FAINT = "#8b95a1";
const LINE = "#d7dce2";
const LINE_SOFT = "#eef0f3";
const BG_SOFT = "#f5f7fa";

const MARGIN = 40;
const PAGE_W = 595.28;
const CONTENT_W = PAGE_W - MARGIN * 2;

function readLogo(): Buffer | undefined {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public/logo/mds-bleu.png"));
  } catch {
    return undefined;
  }
}

type DocData = {
  title: string;
  number: string;
  dateLabel: string;
  secondDateLabel?: string;
  statusLabel: string;
  client: {
    name?: string;
    street?: string;
    zip?: string;
    city?: string;
    email?: string;
    phone?: string;
  };
  items: { label: string; qty: number; unitPrice: number; vatRate: number }[];
  totalHT: number;
  vatBreakdown: { rate: number; amount: number }[];
  grandLabel: string;
  totalTTC: number;
  extraTotalLine?: { label: string; amount: number };
  notesBlocks: string[];
  footerText: string;
  logo?: Buffer;
  company: AppSettings["company"];
  legal: AppSettings["legal"];
};

function collect(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function drawDocument(doc: any, data: DocData) {
  const { company, legal } = data;

  let y = MARGIN;

  // ---------- en-tête : émetteur (gauche) / titre + méta (droite) ----------
  const hasLogo = !!data.logo;
  if (hasLogo) {
    doc.image(data.logo, MARGIN, y, { width: 50, height: 50 });
  }
  const textX = hasLogo ? MARGIN + 62 : MARGIN;
  const leftW = 260;

  doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY);
  doc.text(company.name || "", textX, y, { width: leftW });

  const coLines = [
    company.street,
    [company.zip, company.city].filter(Boolean).join(" "),
    [company.phone, company.email].filter(Boolean).join(" · "),
    legal.siret ? `SIRET ${legal.siret}` : null,
    legal.tvaIntra ? `TVA ${legal.tvaIntra}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
  doc.text(coLines, textX, doc.y + 4, { width: leftW, lineGap: 2 });
  const leftBottomY = doc.y;

  const rightW = 200;
  const rightX = MARGIN + CONTENT_W - rightW;
  doc.font("Helvetica-Bold").fontSize(22).fillColor(NAVY);
  doc.text(data.title, rightX, y, { width: rightW, align: "right" });

  doc.font("Helvetica").fontSize(10).fillColor(INK);
  doc.text(data.number, rightX, doc.y + 2, { width: rightW, align: "right" });

  const metaLines = [data.dateLabel, data.secondDateLabel, `Statut : ${data.statusLabel}`]
    .filter(Boolean)
    .join("\n");
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
  doc.text(metaLines, rightX, doc.y + 4, {
    width: rightW,
    align: "right",
    lineGap: 2,
  });
  const rightBottomY = doc.y;

  y = Math.max(leftBottomY, rightBottomY) + 14;
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + CONTENT_W, y)
    .lineWidth(1.5)
    .strokeColor(NAVY)
    .stroke();
  y += 18;

  // ---------- client ----------
  doc.font("Helvetica").fontSize(7).fillColor(FAINT);
  doc.text("CLIENT", MARGIN, y, { characterSpacing: 1 });
  y = doc.y + 3;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
  doc.text(data.client.name || "", MARGIN, y, { width: CONTENT_W });
  y = doc.y + 3;

  const clientLines = [
    data.client.street,
    [data.client.zip, data.client.city].filter(Boolean).join(" ") || null,
    [data.client.email, data.client.phone].filter(Boolean).join(" · ") || null,
  ]
    .filter(Boolean)
    .join("\n");
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
  doc.text(clientLines, MARGIN, y, { width: CONTENT_W, lineGap: 2 });
  y = doc.y + 18;

  // ---------- tableau des lignes ----------
  const colQtyW = 40;
  const colPriceW = 70;
  const colVatW = 45;
  const colTotalW = 70;
  const colLabelW = CONTENT_W - colQtyW - colPriceW - colVatW - colTotalW;
  const xLabel = MARGIN;
  const xQty = xLabel + colLabelW;
  const xPrice = xQty + colQtyW;
  const xVat = xPrice + colPriceW;
  const xTotal = xVat + colVatW;
  const pageBottom = () => doc.page.height - doc.page.margins.bottom;

  doc.font("Helvetica").fontSize(7).fillColor(FAINT);
  doc.text("DÉSIGNATION", xLabel, y, { width: colLabelW });
  doc.text("QTÉ", xQty, y, { width: colQtyW, align: "right" });
  doc.text("P.U. HT", xPrice, y, { width: colPriceW, align: "right" });
  doc.text("TVA", xVat, y, { width: colVatW, align: "right" });
  doc.text("TOTAL HT", xTotal, y, { width: colTotalW, align: "right" });
  y += 14;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(1).strokeColor(LINE).stroke();
  y += 8;

  doc.font("Helvetica").fontSize(9).fillColor(INK);
  for (const it of data.items) {
    const labelH = doc.heightOfString(it.label || "", { width: colLabelW });
    const rowH = Math.max(16, labelH) + 8;

    if (y + rowH > pageBottom()) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    doc.font("Helvetica").fontSize(9).fillColor(INK);
    doc.text(it.label || "", xLabel, y, { width: colLabelW });
    doc.text(String(it.qty ?? 0), xQty, y, { width: colQtyW, align: "right" });
    doc.text(formatEUR(it.unitPrice), xPrice, y, { width: colPriceW, align: "right" });
    doc.text(`${it.vatRate ?? 0} %`, xVat, y, { width: colVatW, align: "right" });
    doc.text(formatEUR((it.qty || 0) * (it.unitPrice || 0)), xTotal, y, {
      width: colTotalW,
      align: "right",
    });
    y += rowH;
    doc
      .moveTo(MARGIN, y - 4)
      .lineTo(MARGIN + CONTENT_W, y - 4)
      .lineWidth(0.5)
      .strokeColor(LINE_SOFT)
      .stroke();
  }
  y += 10;

  // ---------- bloc du bas (totaux / notes / pied de page), ancré en bas
  // de page quand il reste de la place, comme le PDF imprimable ----------
  const totalsLineH = 14;
  const grandLineH = 26;
  const totalsRowsCount = 1 + data.vatBreakdown.length + (data.extraTotalLine ? 1 : 0);
  const totalsBlockH = totalsLineH * totalsRowsCount + grandLineH;

  doc.font("Helvetica").fontSize(8.5);
  const notesHeights = data.notesBlocks.map(
    (note) => doc.heightOfString(note, { width: CONTENT_W - 20 }) + 20
  );
  const notesBlockH = notesHeights.reduce((s, h) => s + h + 10, 0);

  doc.font("Helvetica").fontSize(7.5);
  const footerH = doc.heightOfString(data.footerText, { width: CONTENT_W }) + 18;

  const bottomBlockH = totalsBlockH + notesBlockH + footerH;
  const targetY = pageBottom() - bottomBlockH;
  if (targetY > y) y = targetY;

  const totalsW = 220;
  const totalsAmountW = 90;
  const totalsX = MARGIN + CONTENT_W - totalsW;

  function totalRow(label: string, amount: number, rowY: number) {
    doc.text(label, totalsX, rowY, { width: totalsW - totalsAmountW });
    doc.text(formatEUR(amount), totalsX + totalsW - totalsAmountW, rowY, {
      width: totalsAmountW,
      align: "right",
    });
  }

  doc.font("Helvetica").fontSize(9).fillColor(MUTED);
  totalRow("Total HT", data.totalHT, y);
  y += totalsLineH;
  for (const { rate, amount } of data.vatBreakdown) {
    doc.font("Helvetica").fontSize(9).fillColor(MUTED);
    totalRow(`TVA ${rate} %`, amount, y);
    y += totalsLineH;
  }

  doc
    .moveTo(totalsX, y + 2)
    .lineTo(totalsX + totalsW, y + 2)
    .lineWidth(1)
    .strokeColor(LINE)
    .stroke();
  doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY);
  totalRow(data.grandLabel, data.totalTTC, y + 8);
  y += grandLineH;

  if (data.extraTotalLine) {
    doc.font("Helvetica").fontSize(9).fillColor(INK);
    totalRow(data.extraTotalLine.label, data.extraTotalLine.amount, y);
    y += totalsLineH;
  }
  y += 10;

  for (let i = 0; i < data.notesBlocks.length; i++) {
    const h = notesHeights[i];
    doc.rect(MARGIN, y, CONTENT_W, h).fill(BG_SOFT);
    doc.font("Helvetica").fontSize(8.5).fillColor("#3a4655");
    doc.text(data.notesBlocks[i], MARGIN + 10, y + 10, {
      width: CONTENT_W - 20,
      lineGap: 2,
    });
    y += h + 10;
  }

  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(1).strokeColor(LINE).stroke();
  y += 10;
  doc.font("Helvetica").fontSize(7.5).fillColor(FAINT);
  doc.text(data.footerText, MARGIN, y, { width: CONTENT_W, lineGap: 3 });
}

function renderPdf(data: DocData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
  });
  const done = collect(doc);
  drawDocument(doc, data);
  doc.end();
  return done;
}

export async function renderDevisPdf(
  d: any,
  company: AppSettings["company"],
  legal: AppSettings["legal"]
): Promise<Buffer> {
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

  return renderPdf({
    title: "DEVIS",
    number: d.number,
    dateLabel: `Émis le ${d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}`,
    secondDateLabel: d.validUntil
      ? `Valable jusqu'au ${new Date(d.validUntil).toLocaleDateString("fr-FR")}`
      : undefined,
    statusLabel: DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status,
    client: {
      name: d.client?.name,
      street: d.client?.street,
      zip: d.client?.zip,
      city: d.client?.city,
      email: d.client?.email,
      phone: d.client?.phone,
    },
    items,
    totalHT: d.totalHT ?? ht,
    vatBreakdown: Array.from(vatMap.entries())
      .filter(([rate]) => rate > 0)
      .map(([rate, amount]) => ({ rate, amount })),
    grandLabel: "Total TTC",
    totalTTC: ttc,
    extraTotalLine:
      d.depositPct > 0
        ? { label: `Acompte à la commande (${d.depositPct} %)`, amount: deposit }
        : undefined,
    notesBlocks: d.notes ? [d.notes] : [],
    footerText: [
      legal.forme,
      legal.rcs,
      legal.ape ? `APE ${legal.ape}` : null,
      legal.assuranceDecennale ? `Assurance décennale : ${legal.assuranceDecennale}.` : null,
      "Bon pour accord (date et signature) :",
    ]
      .filter(Boolean)
      .join(" — "),
    logo: readLogo(),
    company,
    legal,
  });
}

export async function renderFacturePdf(
  f: any,
  company: AppSettings["company"],
  legal: AppSettings["legal"]
): Promise<Buffer> {
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

  const notesBlocks: string[] = [];
  if (f.notes) notesBlocks.push(f.notes);
  if (company.iban) {
    notesBlocks.push(
      `Coordonnées bancaires : règlement par virement à l'ordre de ${company.name}. IBAN ${company.iban}.`
    );
  }

  return renderPdf({
    title: "FACTURE",
    number: f.number,
    dateLabel: `Émise le ${f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—"}`,
    secondDateLabel: f.dueDate
      ? `Échéance le ${new Date(f.dueDate).toLocaleDateString("fr-FR")}`
      : undefined,
    statusLabel,
    client: {
      name: f.client?.name,
      street: f.client?.street,
      zip: f.client?.zip,
      city: f.client?.city,
      email: f.client?.email,
      phone: f.client?.phone,
    },
    items,
    totalHT: f.totalHT ?? ht,
    vatBreakdown: Array.from(vatMap.entries())
      .filter(([rate]) => rate > 0)
      .map(([rate, amount]) => ({ rate, amount })),
    grandLabel: "Total TTC à payer",
    totalTTC: ttc,
    notesBlocks,
    footerText: [
      legal.forme,
      legal.rcs,
      legal.ape ? `APE ${legal.ape}` : null,
      legal.assuranceDecennale ? `Assurance décennale : ${legal.assuranceDecennale}.` : null,
      "Facture à régler avant la date d'échéance indiquée ci-dessus.",
    ]
      .filter(Boolean)
      .join(" — "),
    logo: readLogo(),
    company,
    legal,
  });
}
