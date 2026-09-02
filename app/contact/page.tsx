import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brand-dark">Contact</h1>
      <p className="mt-4 text-slate-600">
        Contactez-nous pour toute demande de devis ou d&apos;information.
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="space-y-2 text-slate-700">
          <p><strong>Téléphone :</strong> à compléter</p>
          <p><strong>Email :</strong> à compléter</p>
          <p><strong>Adresse :</strong> à compléter, Pyrénées-Orientales</p>
          <p><strong>Horaires :</strong> Lun–Ven 8h–12h / 14h–18h</p>
        </div>

        <form className="space-y-4" action="#" method="post">
          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <textarea
            name="message"
            rows={4}
            placeholder="Votre message"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark"
          >
            Envoyer
          </button>
          <p className="text-xs text-slate-400">
            Formulaire non fonctionnel pour l&apos;instant — traitement à brancher en phase 2.
          </p>
        </form>
      </div>
    </div>
  );
}
