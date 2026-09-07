"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileText,
  ReceiptText,
  HardHat,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { href: "/pro", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/pro/demandes", label: "Demandes", icon: Inbox },
  { href: "/pro/clients", label: "Clients", icon: Users, soon: true },
  { href: "/pro/devis", label: "Devis", icon: FileText, soon: true },
  { href: "/pro/factures", label: "Factures", icon: ReceiptText, soon: true },
  { href: "/pro/chantiers", label: "Chantiers", icon: HardHat, soon: true },
  { href: "/pro/planning", label: "Planning", icon: CalendarDays, soon: true },
  { href: "/pro/parametres", label: "Paramètres", icon: Settings, soon: true },
];

export default function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-royal text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-navy"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span className="flex-1">{item.label}</span>
            {item.soon && (
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                bientôt
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="MDS"
          width={120}
          height={120}
          className="h-9 w-auto"
        />
        <button onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } border-b border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r`}
      >
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="Miroiterie de la Salanque"
          width={160}
          height={160}
          className="mb-6 hidden h-14 w-auto lg:block"
        />
        {links}
        <div className="mt-4 border-t border-slate-200 pt-4">
          {email && (
            <p className="mb-2 truncate px-3 text-xs text-slate-400">{email}</p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/pro/login" })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
