import { BadgeIcon, FranceIcon, RulerIcon, UserIcon } from "@/components/icons";

const items = [
  {
    Icon: BadgeIcon,
    title: "25 ans d'expérience",
    text: "Un savoir-faire reconnu depuis plus de 25 ans dans la menuiserie et la serrurerie.",
  },
  {
    Icon: FranceIcon,
    title: "Fabriqué en France à Perpignan",
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
    <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-20">
      {/* Fond montagne discret */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#0e2547,#14315b)]" />
      <svg
        viewBox="0 0 1200 260"
        className="absolute inset-x-0 bottom-0 h-full w-full text-white/[0.06]"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 260 L160 90 L300 180 L440 60 L620 200 L800 90 L980 190 L1130 110 L1200 150 L1200 260 Z" />
      </svg>

      <div className="container-mds relative">
        <h2 className="section-title text-white">25 ans de savoir-faire</h2>

        <div className="mt-12 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
          {items.map(({ Icon, title, text }) => (
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
              <p className="mt-2 text-sm leading-relaxed text-white/80">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
