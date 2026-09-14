import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import DevisPdfDocument from "@/components/pdf/DevisPdfDocument";
import FacturePdfDocument from "@/components/pdf/FacturePdfDocument";
import type { AppSettings } from "@/lib/settings";

/* eslint-disable @typescript-eslint/no-explicit-any */

function readLogo(): Buffer | undefined {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public/logo/mds-bleu.png"));
  } catch {
    return undefined;
  }
}

export async function renderDevisPdf(
  d: any,
  company: AppSettings["company"],
  legal: AppSettings["legal"]
): Promise<Buffer> {
  return renderToBuffer(
    <DevisPdfDocument d={d} company={company} legal={legal} logo={readLogo()} />
  );
}

export async function renderFacturePdf(
  f: any,
  company: AppSettings["company"],
  legal: AppSettings["legal"]
): Promise<Buffer> {
  return renderToBuffer(
    <FacturePdfDocument f={f} company={company} legal={legal} logo={readLogo()} />
  );
}
