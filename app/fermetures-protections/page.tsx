import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Placeholder from "@/components/Placeholder";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Fermetures & protections",
  description:
    "Volets roulants, portes de garage sectionnelles, basculantes ou enroulables, avec ou sans motorisation. Réparation et dépannage rapide dans la Salanque.",
};

const blocks = [
  {
    id: "volets",
    title: "Volets roulants",
    text: "Volets roulants neufs ou en rénovation, avec ou sans motorisation. Réparation et dépannage de tous types de volets (moteur, tablier, lame, télécommande).",
  },
  {
    id: "garage",
    title: "Portes de garage",
    text: "Portes de garage sectionnelles, basculantes ou enroulables, motorisées ou manuelles, isolées et sécurisées, adaptées à toutes les configurations.",
  },
  {
    id: "depannage",
    title: "Dépannage & réparation",
    text: "Un volet bloqué, une serrure qui ne répond plus, une porte de garage en panne ? Intervention rapide dans toute la Salanque pour remettre vos fermetures en service.",
  },
];

export default function FermeturesPage() {
  return (
    <>
      <PageHeader
        title="Fermetures & protections"
        subtitle="Volets roulants, portes de garage et dépannage — installation, motorisation et réparation."
      />
      <div className="container-mds space-y-16 py-16">
        {blocks.map((b, i) => (
          <section
            key={b.id}
            id={b.id}
            className={`grid items-center gap-8 lg:grid-cols-2 ${
              i % 2 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <Placeholder label={b.title} ratio="aspect-[4/3]" className="rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold text-navy">{b.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{b.text}</p>
              <Link href="/contact" className="btn-outline mt-6">
                Nous contacter <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
