import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowRight, CheckIcon, PinIcon, WrenchIcon } from "@/components/icons";

export default function InfoBand() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="container-mds grid gap-6 lg:grid-cols-2">
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
        <div className="relative overflow-hidden rounded-lg bg-navy p-8 text-white">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="relative">
            <PinIcon className="h-10 w-10 text-white/90" />
            <h3 className="mt-4 text-lg font-bold uppercase tracking-wide">
              Notre zone d&apos;intervention
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Basés à Sainte-Marie-la-Mer, nous intervenons dans toute la
              Salanque et les alentours.
            </p>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {site.areas.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 shrink-0 text-white/80" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
