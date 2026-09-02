import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Menuiseries", href: "/menuiseries" },
  { label: "Réalisations", href: "/realisations" },
  { label: "L'entreprise", href: "/entreprise" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-200">
      <div className="container-mds grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/logo/mds-blanc.png"
            alt="Miroiterie de la Salanque"
            width={240}
            height={240}
            className="h-32 w-auto sm:h-40"
          />
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Informations
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/mentions-legales" className="hover:text-white">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/politique-de-confidentialite" className="hover:text-white">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li>
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-mds py-5 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} {site.name} — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
