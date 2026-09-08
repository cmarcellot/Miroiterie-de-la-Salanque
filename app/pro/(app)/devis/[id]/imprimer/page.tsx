import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Devis from "@/lib/models/Devis";
import DevisDocument from "@/components/pro/DevisDocument";
import PrintButton from "@/components/pro/PrintButton";

export const dynamic = "force-dynamic";

export default async function DevisPrintPage({
  params,
}: {
  params: { id: string };
}) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await Devis.findById(params.id).lean();
  if (!d) notFound();

  return (
    <div className="print-wrap">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Link
          href={`/pro/devis/${params.id}`}
          className="pro-btn ghost"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <PrintButton />
      </div>

      <div className="print-sheet">
        <DevisDocument d={JSON.parse(JSON.stringify(d))} />
      </div>
    </div>
  );
}
