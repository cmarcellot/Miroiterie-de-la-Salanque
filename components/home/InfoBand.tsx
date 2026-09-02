import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import { site } from "@/lib/site";
import { ArrowRight, CheckIcon, PinIcon, WrenchIcon } from "@/components/icons";

export default function InfoBand() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="container-mds grid gap-6 lg:grid-cols-3">
        {/* Dépannage */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <WrenchIcon className="h-10 w-10 text-navy" />
          <h3 className="mt-4 text-lg font-bold uppercase tracking-wide text-navy">
            Dépannage & réparation
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Un problème avec votre volet roulant ? Une serrure bloquée ?
            Intervention rapide dans toute la Salanque pour la réparation et
            le dépannage.
          </p>
          <Link href="/contact" className="btn-outline mt-6">
            Intervention rapide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Zone d'intervention */}
        <div className="rounded-lg bg-navy p-8 text-white">
          <PinIcon className="h-10 w-10 text-white/90" />
          <h3 className="mt-4 text-lg font-bold uppercase tracking-wide">
            Notre zone d&apos;intervention
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            Basés à Perpignan, nous intervenons dans toute la Salanque et les
            alentours.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {site.areas.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 shrink-0 text-white/80" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Fabriqué à Perpignan */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <Placeholder label="Atelier — Perpignan" ratio="aspect-[16/10]" />
          <div className="p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-9 overflow-hidden rounded-sm border border-slate-200">
                <span className="w-1/3 bg-[#0055A4]" />
                <span className="w-1/3 bg-white" />
                <span className="w-1/3 bg-[#EF4135]" />
              </span>
              <h3 className="text-lg font-bold uppercase tracking-wide text-navy">
                Fabriqué à Perpignan
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Des produits conçus et fabriqués dans notre atelier à Perpignan.
              Qualité, précision et durabilité sont au cœur de notre engagement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
