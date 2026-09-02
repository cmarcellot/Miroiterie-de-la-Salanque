import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-brand">
          Miroiterie de la Salanque
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
