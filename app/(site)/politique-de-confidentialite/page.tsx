import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <div className="container-mds prose prose-slate max-w-3xl py-16">
        <p>
          Cette page décrit comment {site.name} traite les données personnelles
          collectées via ce site.
        </p>

        <h2>Données collectées</h2>
        <p>
          Via les formulaires de contact et de devis : nom, email, téléphone et
          contenu du message. Ces données sont enregistrées afin de traiter
          votre demande.
        </p>

        <h2>Utilisation</h2>
        <p>
          Les données servent uniquement à répondre à votre demande et à
          assurer le suivi commercial. Elles ne sont ni vendues ni cédées à des
          tiers.
        </p>

        <h2>Conservation</h2>
        <p>
          Les demandes sont conservées le temps nécessaire au traitement, puis
          archivées ou supprimées (durée à préciser).
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l&apos;accès, la rectification ou la suppression
          de vos données en écrivant à {site.email}.
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site n&apos;utilise pas de cookies de suivi publicitaire. (À
          adapter si un outil de mesure d&apos;audience est ajouté.)
        </p>
      </div>
    </>
  );
}
