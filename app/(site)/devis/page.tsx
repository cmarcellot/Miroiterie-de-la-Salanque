import type { Metadata } from "next";
import QuoteWizard from "@/components/QuoteWizard";

export const metadata: Metadata = {
  title: "Devis gratuit — fenêtres, portails, vérandas, volets",
  description:
    "Demandez un devis gratuit et sans engagement pour vos fenêtres, portails, clôtures, pergolas, vérandas, volets roulants ou portes de garage, à Perpignan et dans la Salanque.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return <QuoteWizard />;
}
