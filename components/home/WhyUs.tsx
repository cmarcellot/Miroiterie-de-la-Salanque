import Image from "next/image";
import { BadgeIcon, FranceIcon, RulerIcon, UserIcon } from "@/components/icons";

const items = [
  {
    Icon: BadgeIcon,
    title: "30 ans d'expérience",
    text: "Un savoir-faire reconnu depuis plus de 30 ans dans la menuiserie et la serrurerie.",
  },
  {
    Icon: FranceIcon,
    title: "Fabriqué en France à Perpignan",
    text: "Une fabrication locale pour garantir qualité, précision et réactivité.",
    flag: true,
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
    <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-20">
      <Image
        src="/images/savoir-faire-canigou.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Voile uniforme (le texte occupe toute la largeur) : le plus léger
          possible tout en gardant le texte blanc lisible. */}
      <div className="absolute inset-0 bg-navy-dark/50" />

      <div className="container-mds relative">
        <h2 className="section-title text-white">30 ans de savoir-faire</h2>

        <div className="mt-12 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
          {items.map(({ Icon, title, text, flag }) => (
            <div
              key={title}
              className="flex flex-col items-center px-6 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40">
                <Icon className="h-8 w-8 text-white" />
              </span>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">
                {title}
              </h3>
              {flag && (
                <span className="mt-2 flex h-1 w-16 overflow-hidden rounded-full">
                  <span className="w-1/3 bg-[#0055A4]" />
                  <span className="w-1/3 bg-white" />
                  <span className="w-1/3 bg-[#EF4135]" />
                </span>
              )}
              <p className="mt-2 text-sm leading-relaxed text-white/80">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
