import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <Image
        src="/images/hero-villa-canigou.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Assombrit la photo pour garder le texte blanc lisible, plus sombre côté texte. */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/70 to-navy-dark/30" />
      <svg
        viewBox="0 0 1200 200"
        className="absolute bottom-0 left-0 w-full text-white/5"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 200 L180 60 L320 150 L470 40 L640 170 L820 70 L1000 160 L1200 90 L1200 200 Z" />
      </svg>

      <div className="container-mds relative py-24 sm:py-32">
        <div className="max-w-xl">
          <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-white/80">
            <span className="h-4 w-0.5 bg-white/80" />
            30 ans d&apos;expérience
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Le sur-mesure pour vos
            <br />
            projets et créations
          </h1>
          <p className="mt-6 text-base leading-relaxed text-white/85">
            Menuiserie et serrurerie à Perpignan et dans la Salanque.
            Des produits de qualité, fabriqués en France, associés à des
            interventions rapides et un suivi attentif de chaque chantier.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/realisations" className="btn-primary">
              Découvrir nos réalisations <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/devis" className="btn-white">
              Demander un devis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
