import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/pro/Sidebar";

export const metadata: Metadata = {
  title: "Espace pro",
  robots: { index: false, follow: false },
};

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar email={session?.user?.email} />
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
