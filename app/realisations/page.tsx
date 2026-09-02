import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Placeholder from "@/components/Placeholder";
import { realisations } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Découvrez nos chantiers de menuiserie à Perpignan et dans la Salanque : fenêtres, baies vitrées, portails, clôtures, pergolas, vérandas et portes de garage.",
};

// 3 vignettes par catégorie en attendant les vraies photos.
const gallery = realisations.flatMap((r) =>
  [1, 2, 3].map((n) => ({ ...r, key: `${r.slug}-${n}` }))
);

export default function RealisationsPage() {
  return (
    <>
      <PageHeader
        title="Nos réalisations"
        subtitle="Un aperçu de nos chantiers récents. Chaque projet est étudié et fabriqué sur-mesure."
      />
      <div className="container-mds py-16">
        {realisations.map((cat) => (
          <section key={cat.slug} id={cat.slug} className="mb-14 scroll-mt-24">
            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-navy">
              {cat.label}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery
                .filter((g) => g.slug === cat.slug)
                .map((g) => (
                  <Placeholder
                    key={g.key}
                    label={cat.label}
                    ratio="aspect-[4/3]"
                    className="rounded-md"
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
