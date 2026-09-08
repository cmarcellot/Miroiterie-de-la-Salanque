"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";

type Item = {
  href: string;
  label: string;
  exact?: boolean;
  soon?: boolean;
  count?: number;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Pilotage",
    items: [
      { href: "/pro", label: "Tableau de bord", exact: true },
      { href: "/pro/demandes", label: "Demandes" },
      { href: "/pro/devis", label: "Devis" },
      { href: "/pro/planning", label: "Planning", soon: true },
    ],
  },
  {
    title: "Gestion",
    items: [
      { href: "/pro/clients", label: "Clients" },
      { href: "/pro/factures", label: "Factures", soon: true },
      { href: "/pro/chantiers", label: "Chantiers", soon: true },
    ],
  },
  {
    title: "Système",
    items: [{ href: "/pro/parametres", label: "Paramètres" }],
  },
];

export default function Sidebar({
  email,
  pending,
  clients,
  devisEnAttente,
}: {
  email?: string | null;
  pending: number;
  clients: number;
  devisEnAttente: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <aside className="pro-side">
      <div className="pro-brand">
        <Image
          src="/logo/mds-bleu-transparent.png"
          alt="Miroiterie de la Salanque"
          width={120}
          height={120}
          className="h-9 w-auto"
        />
        <div>
          <div className="n">
            Miroiterie
            <br />
            de la Salanque
          </div>
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
              let count = item.count;
              if (item.href === "/pro/demandes" && pending > 0) count = pending;
              if (item.href === "/pro/clients" && clients > 0) count = clients;
              if (item.href === "/pro/devis" && devisEnAttente > 0)
                count = devisEnAttente;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`pro-nav${active ? " on" : ""}`}
                >
                  <i className="ic" />
                  {item.label}
                  {count ? (
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
          {email && <div className="pro-mono">{email}</div>}
          <button
            type="button"
            className="pro-signout mt-2"
            onClick={() => signOut({ callbackUrl: "/pro/login" })}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  );
}
