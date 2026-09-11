import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import { getSettings } from "@/lib/settings";
import DevisDocument from "@/components/pro/DevisDocument";
import PrintButton from "@/components/pro/PrintButton";

export const dynamic = "force-dynamic";

export default async function DevisPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Devis.findById(id).lean();
  if (!d) notFound();

  const settings = await getSettings();

  return (
    <div className="print-wrap">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Link
          href={`/pro/devis/${id}`}
          className="pro-btn ghost"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <PrintButton />
      </div>

      <div className="print-sheet">
        <DevisDocument
          d={JSON.parse(JSON.stringify(d))}
          company={settings.company}
          legal={settings.legal}
        />
      </div>
    </div>
  );
}
