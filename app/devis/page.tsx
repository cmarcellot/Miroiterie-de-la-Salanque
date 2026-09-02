import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Demandez un devis gratuit pour vos fenêtres, portails, clôtures, pergolas, vérandas ou portes de garage.",
};

const points = [
  "Étude gratuite et sans engagement",
  "Prise de mesures sur place",
  "Produits fabriqués en France à Perpignan",
  "Pose et suivi assurés par nos équipes",
];

export default function DevisPage() {
  return (
    <>
      <PageHeader
        title="Demander un devis"
        subtitle="Décrivez votre projet, nous vous recontactons rapidement pour l'étudier ensemble."
      />
      <div className="container-mds grid gap-12 py-16 lg:grid-cols-2">
        <ul className="space-y-4">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-slate-700">
              <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
              {p}
            </li>
          ))}
        </ul>
        <div>
          <ContactForm source="devis" />
        </div>
      </div>
    </>
  );
}
