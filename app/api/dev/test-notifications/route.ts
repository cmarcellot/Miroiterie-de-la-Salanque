import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFacturesEnRetard } from "@/lib/jobs/factures-en-retard";
import { checkDevisExpirants } from "@/lib/jobs/devis-expirants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORAIRE — déclenche à la main les vérifications quotidiennes (sinon
 * lancées à 8h par instrumentation.ts), pour tester sans attendre le
 * lendemain. Réservé à une session espace pro. À supprimer une fois validé.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  await checkFacturesEnRetard();
  await checkDevisExpirants();
  return NextResponse.json({
    ok: true,
    message: "Vérifications exécutées — voir les logs Dokploy pour le détail.",
  });
}
