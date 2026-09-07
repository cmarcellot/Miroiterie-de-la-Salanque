import Link from "next/link";
import DeptMap from "@/components/DeptMap";
import { ArrowRight, PinIcon, WrenchIcon } from "@/components/icons";

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
            le dépannage. Dépannages urgents assurés le week-end et les jours
            fériés.
          </p>
          <Link href="/contact" className="btn-outline mt-6">
            Intervention rapide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Zone d'intervention */}
        <div className="relative overflow-hidden rounded-lg bg-navy p-8 text-white">
          <DeptMap className="pointer-events-none absolute inset-y-6 right-4 h-[calc(100%-3rem)] w-auto text-white/[0.12]" />
          <div className="relative max-w-sm">
            <PinIcon className="h-10 w-10 text-white/90" />
            <h3 className="mt-4 text-lg font-bold uppercase tracking-wide">
              Notre zone d&apos;intervention
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Nous intervenons dans tout le département des Pyrénées-Orientales
              (66). Au-delà, chaque demande est étudiée au cas par cas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
