import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Placeholder from "@/components/Placeholder";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Menuiseries aluminium & PVC",
  description:
    "Fenêtres et portes-fenêtres PVC ou aluminium, baies vitrées, portes d'entrée, portails, portillons, clôtures, pergolas et vérandas — fabriqués en France à Perpignan.",
};

const blocks = [
  {
    id: "fenetres",
    title: "Fenêtres & portes-fenêtres",
    text: "Fenêtres et portes-fenêtres en PVC ou aluminium, isolation thermique et phonique performante, large choix de coloris et de finitions.",
  },
  {
    id: "baies",
    title: "Baies vitrées",
    text: "Baies coulissantes et à galandage pour ouvrir largement vos espaces de vie, avec seuil plat et vitrage sécurité.",
  },
  {
    id: "portes",
    title: "Portes d'entrée",
    text: "Portes d'entrée sur-mesure en aluminium, sécurisées et personnalisables, pour allier design et performance.",
  },
  {
    id: "portails",
    title: "Portails & portillons",
    text: "Portails battants ou coulissants et portillons assortis en aluminium, motorisables, résistants au climat méditerranéen.",
  },
  {
    id: "clotures",
    title: "Clôtures",
    text: "Clôtures aluminium brise-vue et brise-vent, occultation totale ou partielle, coordonnées avec vos portails.",
  },
  {
    id: "pergolas",
    title: "Pergolas & vérandas",
    text: "Pergolas bioclimatiques et vérandas aluminium pour profiter de l'extérieur toute l'année, sur-mesure.",
  },
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

export default function MenuiseriesPage() {
  return (
    <>
      <PageHeader
        title="Nos menuiseries"
        subtitle="Fenêtres, portes, portails, clôtures, pergolas, vérandas, volets roulants et portes de garage en aluminium et PVC, fabriqués en France à Perpignan. Réparation et dépannage assurés."
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
              <Link href="/devis" className="btn-outline mt-6">
                Demander un devis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
