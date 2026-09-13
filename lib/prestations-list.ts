import { connectToDatabase } from "@/lib/mongodb";
import Prestation from "@/lib/models/Prestation";

export type CatalogItem = {
  id: string;
  name: string;
  unitPrice: number;
  vatRate: number;
};

/** Catalogue actif (produits + prestations), pour l'auto-complétion des lignes de devis/facture. */
export async function getCatalogOptions(): Promise<CatalogItem[]> {
  await connectToDatabase();
  const items = await Prestation.find(
    { active: true },
    { name: 1, unitPrice: 1, vatRate: 1 }
  )
    .sort({ name: 1 })
    .lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (items as any[]).map((p) => ({
    id: String(p._id),
    name: p.name,
    unitPrice: p.unitPrice || 0,
    vatRate: p.vatRate ?? 20,
  }));
}
