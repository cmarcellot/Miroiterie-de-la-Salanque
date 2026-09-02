import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez la Miroiterie de la Salanque à Saint-Laurent-de-la-Salanque : devis, informations, dépannage.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        subtitle="Une question, un projet, un dépannage ? Écrivez-nous ou appelez-nous."
      />
      <div className="container-mds grid gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-6 text-slate-700">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
              Téléphone
            </h2>
            <a href={site.phoneHref} className="mt-1 block text-lg text-royal">
              {site.phone}
            </a>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
              Email
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-1 block text-royal"
            >
              {site.email}
            </a>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
              Adresse
            </h2>
            <p className="mt-1">
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
              Zone d&apos;intervention
            </h2>
            <p className="mt-1">Perpignan et toute la Salanque</p>
          </div>
        </div>

        <div>
          <ContactForm source="contact" />
        </div>
      </div>
    </>
  );
}
