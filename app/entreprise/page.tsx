import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Placeholder from "@/components/Placeholder";
import { BadgeIcon, FranceIcon, RulerIcon, UserIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "L'entreprise",
  description:
    "Miroiterie de la Salanque : 25 ans d'expérience en menuiserie et serrurerie à Perpignan, avec une fabrication française et un suivi attentif de chaque chantier.",
};

const values = [
  { Icon: BadgeIcon, title: "25 ans d'expérience", text: "Un savoir-faire reconnu dans la menuiserie et la serrurerie." },
  { Icon: FranceIcon, title: "Fabrication française", text: "Des produits conçus et fabriqués dans notre atelier à Perpignan." },
  { Icon: RulerIcon, title: "Sur-mesure", text: "Chaque projet est étudié et adapté à vos besoins." },
  { Icon: UserIcon, title: "Suivi attentif", text: "Un interlocuteur dédié, de l'étude à la pose." },
];

export default function EntreprisePage() {
  return (
    <>
      <PageHeader
        title="L'entreprise"
        subtitle="Menuiserie et serrurerie à Perpignan et dans toute la Salanque."
      />
      <div className="container-mds py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Placeholder label="Atelier & équipe" ratio="aspect-[4/3]" className="rounded-lg" />
          <div>
            <h2 className="text-2xl font-bold text-navy">Notre savoir-faire</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Depuis plus de 25 ans, la Miroiterie de la Salanque accompagne
              les particuliers et les professionnels dans leurs projets de
              menuiserie aluminium et PVC, de fermetures et de serrurerie.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Fenêtres et portes-fenêtres, baies vitrées, pergolas, vérandas,
              portails, portillons et clôtures brise-vue et brise-vent en
              aluminium, mais aussi réparation de volets roulants et de portes
              de garage sectionnelles, basculantes ou enroulables, avec ou sans
              motorisation.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Des produits de qualité, fabriqués en France à Perpignan,
              associés à des interventions rapides et un suivi attentif de
              chaque chantier.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon className="h-12 w-12 text-navy" />
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-navy">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
