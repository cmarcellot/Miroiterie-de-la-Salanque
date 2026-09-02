"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/site";
import { ArrowRight } from "./icons";

export default function Header() {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container-mds relative flex min-h-[88px] items-center justify-end gap-5 py-4 pl-24 sm:pl-36 lg:pl-44 xl:gap-6">
        <Link
          href="/"
          className="absolute left-4 top-2 z-20 sm:left-6 lg:left-8"
          aria-label="Accueil — Miroiterie de la Salanque"
        >
          <span className="flex items-center justify-center rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200">
            <Image
              src="/logo/mds-bleu-transparent.png"
              alt="Miroiterie de la Salanque"
              width={220}
              height={220}
              className="h-[76px] w-auto sm:h-28 lg:h-[8rem]"
              priority
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          {mainNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 whitespace-nowrap py-2 text-[13px] font-semibold uppercase tracking-wide transition ${
                    active ? "text-royal" : "text-navy hover:text-royal"
                  }`}
                >
                  {item.label}
                  {item.children && (
                    <span className="text-[10px] text-slate-400">▾</span>
                  )}
                </Link>
                {active && (
                  <span className="absolute -bottom-[1px] left-0 h-0.5 w-full bg-royal" />
                )}
                {item.children && (
                  <div className="invisible absolute left-0 top-full z-50 min-w-[240px] translate-y-1 rounded-md border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-royal"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/devis"
            className="btn-primary whitespace-nowrap px-4 py-2.5 text-xs xl:px-6 xl:py-3 xl:text-sm"
          >
            Demander un devis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={openMobile}
          onClick={() => setOpenMobile((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-navy" fill="none" stroke="currentColor" strokeWidth={2}>
            {openMobile ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {openMobile && (
        <div className="border-t border-slate-200 lg:hidden">
          <nav className="container-mds flex flex-col py-3">
            {mainNav.map((item) => (
              <div key={item.href} className="border-b border-slate-100 py-1">
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-semibold uppercase tracking-wide text-navy"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pb-2 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block py-1.5 text-sm text-slate-600"
                        onClick={() => setOpenMobile(false)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/devis"
              className="btn-primary mt-4 justify-center"
              onClick={() => setOpenMobile(false)}
            >
              Demander un devis <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
