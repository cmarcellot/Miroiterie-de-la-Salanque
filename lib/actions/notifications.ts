"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getNotifications } from "@/lib/notifications";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non autorisé.");
  return session.user.id;
}

/**
 * Cloche : marque comme lues les notifications affichées au moment du clic
 * (`ids` vient du client, pour ne pas marquer une notification apparue
 * entre-temps). Ne touche à aucun statut de demande, devis ou facture.
 */
export async function markAllNotificationsRead(ids: string[]) {
  const userId = await requireUserId();
  await connectToDatabase();

  const user = (await User.findById(userId, { notificationsReadIds: 1 }).lean()) as {
    notificationsReadIds?: string[];
  } | null;
  const wanted = new Set([...(user?.notificationsReadIds || []), ...ids]);

  // On ne garde que les ids correspondant encore à une notification existante,
  // pour que la liste ne grossisse pas indéfiniment.
  const current = await getNotifications();
  const notificationsReadIds = current.map((n) => n.id).filter((id) => wanted.has(id));

  await User.findByIdAndUpdate(userId, { notificationsReadIds });

  revalidatePath("/pro", "layout");
}
