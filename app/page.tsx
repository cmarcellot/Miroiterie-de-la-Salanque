import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="bg-brand-light">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-brand-dark sm:text-5xl">
            Miroiterie de la Salanque
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Fabrication et pose de vitrages, miroirs, vérandas et menuiseries
            aluminium dans les Pyrénées-Orientales.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
          >
            Demander un devis
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-800">Notre savoir-faire</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ["Vitrerie", "Remplacement de vitrages, double vitrage, verre sur mesure."],
            ["Miroirs", "Miroirs sur mesure, pose murale, dressings et salles de bain."],
            ["Menuiserie alu", "Fenêtres, baies vitrées, vérandas et garde-corps."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-brand">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
