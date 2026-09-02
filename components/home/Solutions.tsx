import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { solutions } from "@/lib/site";
import { solutionIcons } from "@/components/icons";

export default function Solutions() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-mds">
        <SectionHeading>Nos menuiseries</SectionHeading>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {solutions.map((s) => {
            const Icon = solutionIcons[s.icon];
            const href =
              s.icon === "shutter" || s.icon === "garage"
                ? `/fermetures-protections#${s.id}`
                : `/menuiseries#${s.id}`;
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
        </div>
      </div>
    </section>
  );
}
