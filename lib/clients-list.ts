import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import { clientDisplayName } from "@/lib/pro-enums";

/** Liste légère { id, name } de tous les clients, triée par libellé. */
export async function getClientOptions(): Promise<
  { id: string; name: string }[]
> {
  await connectToDatabase();
  const clients = await Client.find(
    {},
    { firstName: 1, lastName: 1, company: 1, type: 1 }
  ).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (clients as any[])
    .map((c) => ({ id: String(c._id), name: clientDisplayName(c) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
