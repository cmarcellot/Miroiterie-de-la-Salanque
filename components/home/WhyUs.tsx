import { BadgeIcon, FranceIcon, RulerIcon, UserIcon } from "@/components/icons";

const items = [
  {
    Icon: BadgeIcon,
    title: "25 ans d'expérience",
    text: "Un savoir-faire reconnu depuis plus de 25 ans dans la menuiserie et la serrurerie.",
  },
  {
    Icon: FranceIcon,
    title: "Fabrication française à Perpignan",
    text: "Une fabrication locale pour garantir qualité, précision et réactivité.",
  },
  {
    Icon: RulerIcon,
    title: "Sur-mesure",
    text: "Des solutions adaptées à chaque projet, pour les particuliers comme pour les pros.",
  },
  {
    Icon: UserIcon,
    title: "Suivi attentif",
    text: "Un interlocuteur dédié et un suivi rigoureux du projet à la pose.",
  },
];

export default function WhyUs() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="container-mds">
        <h2 className="section-title">Pourquoi choisir MDS ?</h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, text }) => (
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
    </section>
  );
}
