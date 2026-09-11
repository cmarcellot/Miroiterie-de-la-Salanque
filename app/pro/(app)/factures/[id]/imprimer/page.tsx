import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Facture from "@/lib/models/Facture";
import { getSettings } from "@/lib/settings";
import FactureDocument from "@/components/pro/FactureDocument";
import PrintButton from "@/components/pro/PrintButton";

export const dynamic = "force-dynamic";

export default async function FacturePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = await Facture.findById(id).lean();
  if (!f) notFound();

  const settings = await getSettings();

  return (
    <div className="print-wrap">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Link href={`/pro/factures/${id}`} className="pro-btn ghost">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <PrintButton />
      </div>

      <div className="print-sheet">
        <FactureDocument
          f={JSON.parse(JSON.stringify(f))}
          company={settings.company}
          legal={settings.legal}
        />
      </div>
    </div>
  );
}
