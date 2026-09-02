import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      <div className="container-mds prose prose-slate max-w-3xl py-16">
        <h2>Éditeur du site</h2>
        <p>
          {site.name}
          <br />
          {site.address.street}, {site.address.zip} {site.address.city}
          <br />
          Téléphone : {site.phone}
          <br />
          Email : {site.email}
          <br />
          SIRET : à compléter — Forme juridique : à compléter — Directeur de la
          publication : à compléter.
        </p>

        <h2>Hébergement</h2>
        <p>
          Serveur hébergé par : à compléter (nom, adresse et téléphone de
          l&apos;hébergeur du VPS).
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus (textes, images, logo) est la propriété
          de {site.name} sauf mention contraire. Toute reproduction sans
          autorisation est interdite.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Les informations transmises via les formulaires sont utilisées
          uniquement pour répondre aux demandes. Voir la{" "}
          <a href="/politique-de-confidentialite">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </>
  );
}
