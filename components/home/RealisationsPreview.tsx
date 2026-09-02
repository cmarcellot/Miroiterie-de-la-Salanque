import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Placeholder from "@/components/Placeholder";
import { realisations } from "@/lib/site";
import { ArrowRight } from "@/components/icons";

export default function RealisationsPreview() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-mds">
        <SectionHeading>Nos réalisations</SectionHeading>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {realisations.map((r) => (
            <Link
              key={r.slug}
              href={`/realisations#${r.slug}`}
              className="group overflow-hidden rounded-md border border-slate-200"
            >
              <Placeholder label={r.label} ratio="aspect-square" />
              <div className="bg-royal py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
                {r.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/realisations" className="btn-outline">
            Voir toutes nos réalisations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
