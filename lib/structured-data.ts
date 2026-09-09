import { site, solutions } from "@/lib/site";

const SITE_URL = "https://www.miroiteriedelasalanque.fr";

const CITIES = [
  "Perpignan",
  "Canet-en-Roussillon",
  "Sainte-Marie-la-Mer",
  "Saint-Laurent-de-la-Salanque",
  "Le Barcarès",
  "Torreilles",
  "Bompas",
  "Claira",
  "Pia",
];

/** Données structurées LocalBusiness pour l'entreprise. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#business`,
    name: site.name,
    alternateName: "MDS Miroiterie de la Salanque",
    description:
      "Menuisier à Perpignan et dans la Salanque : fenêtres et portes-fenêtres alu ou PVC, portails, portillons, clôtures, pergolas, vérandas, volets roulants, portes de garage et rideaux métalliques. Réparation et dépannage. 30 ans d'expérience, produits fabriqués en France.",
    url: SITE_URL,
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    image: `${SITE_URL}/logo/mds-bleu.png`,
    logo: `${SITE_URL}/logo/mds-bleu.png`,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Espèces, Chèque, Virement",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.zip,
      addressLocality: site.address.city,
      addressRegion: "Pyrénées-Orientales",
      addressCountry: "FR",
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Pyrénées-Orientales (66)" },
      ...CITIES.map((name) => ({ "@type": "City", name })),
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "12:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "13:30",
        closes: "18:00",
      },
    ],
    knowsAbout: [
      "Menuiserie aluminium",
      "Menuiserie PVC",
      "Pose de fenêtres",
      "Portails et clôtures",
      "Pergolas et vérandas",
      "Volets roulants",
      "Portes de garage",
      "Rideaux métalliques",
      "Serrurerie",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations",
      itemListElement: solutions.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title },
      })),
    },
  };
}
