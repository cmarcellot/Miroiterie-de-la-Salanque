import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { solutions } from "@/lib/site";
import { solutionIcons, FranceIcon } from "@/components/icons";

export default function Solutions() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-mds">
        <SectionHeading>Nos menuiseries</SectionHeading>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {solutions.map((s) => {
            const Icon = solutionIcons[s.icon];
            const href = `/menuiseries#${s.id}`;
            return (
              <Link
                key={s.id}
                href={href}
                className="group flex flex-col items-center rounded-lg border border-slate-200 p-5 text-center transition hover:border-royal hover:shadow-md"
              >
                <Icon className="h-12 w-12 text-navy transition group-hover:text-royal" />
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-navy">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{s.subtitle}</p>
              </Link>
            );
          })}

          {/* Fabrication française à Perpignan */}
          <div className="col-span-2 flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-center sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <FranceIcon className="h-10 w-10 shrink-0 text-navy" />
              <h3 className="text-base font-bold uppercase leading-tight tracking-wide text-navy">
                Fabrication française
                <br />à Perpignan
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Des produits conçus et fabriqués dans notre atelier à Perpignan.
            </p>
            <span className="mt-4 flex h-1 w-24 overflow-hidden rounded-full">
              <span className="w-1/3 bg-[#0055A4]" />
              <span className="w-1/3 bg-slate-300" />
              <span className="w-1/3 bg-[#EF4135]" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
