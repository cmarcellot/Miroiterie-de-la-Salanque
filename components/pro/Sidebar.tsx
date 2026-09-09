"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Inbox,
  FileText,
  Users,
  ReceiptText,
  HardHat,
  Settings,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  soon?: boolean;
  count?: number;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Activité",
    items: [
      { href: "/pro", label: "Tableau de bord", icon: LayoutGrid, exact: true },
      { href: "/pro/demandes", label: "Demandes", icon: Inbox },
      { href: "/pro/devis", label: "Devis", icon: FileText },
      { href: "/pro/clients", label: "Clients", icon: Users },
    ],
  },
  {
    title: "Production",
    items: [
      { href: "/pro/factures", label: "Factures", icon: ReceiptText, soon: true },
      { href: "/pro/chantiers", label: "Chantiers", icon: HardHat, soon: true },
    ],
  },
];

export default function Sidebar({
  pending,
  clients,
  devisEnAttente,
}: {
  pending: number;
  clients: number;
  devisEnAttente: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const countFor = (href: string) => {
    if (href === "/pro/demandes") return pending;
    if (href === "/pro/clients") return clients;
    if (href === "/pro/devis") return devisEnAttente;
    return 0;
  };

  return (
    <aside className="pro-side">
      <div className="pro-brand">
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="Miroiterie de la Salanque"
          width={120}
          height={120}
          className="h-10 w-auto shrink-0"
        />
        <div>
          <div className="n">Miroiterie de la Salanque</div>
          <div className="r">Espace pro</div>
        </div>
        <button
          type="button"
          className="ml-auto lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={open ? "contents" : "hidden lg:contents"}>
        {sections.map((section) => (
          <div key={section.title} className="contents">
            <h4>{section.title}</h4>
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const count = countFor(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`pro-nav${active ? " on" : ""}`}
                >
                  <span className="ico">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  {item.label}
                  {count > 0 ? (
                    <span className="cnt">{count}</span>
                  ) : item.soon ? (
                    <span className="soon">bientôt</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="foot">
          <Link
            href="/pro/parametres"
            onClick={() => setOpen(false)}
            className={`pro-nav${
              pathname.startsWith("/pro/parametres") ? " on" : ""
            }`}
          >
            <span className="ico">
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Paramètres
          </Link>
          <button
            type="button"
            className="pro-signout"
            onClick={() => signOut({ callbackUrl: "/pro/login" })}
          >
            <span className="ico">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  );
}
