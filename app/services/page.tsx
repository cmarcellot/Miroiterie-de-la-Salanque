import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services" };

const services = [
  {
    title: "Vitrerie",
    items: [
      "Remplacement de vitrage cassé (intervention rapide)",
      "Double et triple vitrage isolant",
      "Verre trempé, feuilleté, dépoli sur mesure",
    ],
  },
  {
    title: "Miroiterie",
    items: [
      "Miroirs sur mesure avec ou sans biseau",
      "Portes de placard et dressings",
      "Crédences et parois de douche en verre",
    ],
  },
  {
    title: "Menuiserie aluminium",
    items: [
      "Fenêtres et portes-fenêtres",
      "Baies coulissantes et galandage",
      "Vérandas, pergolas et garde-corps",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brand-dark">Nos services</h1>
      <div className="mt-10 space-y-10">
        {services.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold text-brand">{s.title}</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
