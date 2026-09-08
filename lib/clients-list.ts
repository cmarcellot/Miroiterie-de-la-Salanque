import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";

/** Liste légère { id, name } de tous les clients, triée par nom. */
export async function getClientOptions(): Promise<
  { id: string; name: string }[]
> {
  await connectToDatabase();
  const clients = await Client.find({}, { name: 1 }).sort({ name: 1 }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (clients as any[]).map((c) => ({
    id: String(c._id),
    name: c.name as string,
  }));
}
