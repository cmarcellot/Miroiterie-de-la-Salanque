export const site = {
  name: "Miroiterie de la Salanque",
  shortName: "MDS",
  phone: "04 68 08 50 20",
  phoneHref: "tel:+33468085020",
  email: "contact@miroiterie-salanque.fr",
  address: {
    street: "8 Rue des Artisans",
    zip: "66250",
    city: "Saint-Laurent-de-la-Salanque",
  },
  facebook: "https://www.facebook.com/",
  areas: [
    "Perpignan",
    "Saint-Laurent-de-la-Salanque",
    "Le Barcarès",
    "Torreilles",
    "Et toute la Salanque",
  ],
};

export const mainNav: {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Menuiseries",
    href: "/menuiseries",
    children: [
      { label: "Fenêtres & portes-fenêtres", href: "/menuiseries#fenetres" },
      { label: "Baies vitrées", href: "/menuiseries#baies" },
      { label: "Portes d'entrée", href: "/menuiseries#portes" },
      { label: "Portails & portillons", href: "/menuiseries#portails" },
      { label: "Clôtures", href: "/menuiseries#clotures" },
      { label: "Pergolas & vérandas", href: "/menuiseries#pergolas" },
    ],
  },
  {
    label: "Fermetures & protections",
    href: "/fermetures-protections",
    children: [
      { label: "Volets roulants", href: "/fermetures-protections#volets" },
      { label: "Portes de garage", href: "/fermetures-protections#garage" },
      { label: "Dépannage & réparation", href: "/fermetures-protections#depannage" },
    ],
  },
  { label: "Réalisations", href: "/realisations" },
  { label: "L'entreprise", href: "/entreprise" },
  { label: "Contact", href: "/contact" },
];

export const solutions = [
  {
    id: "fenetres",
    icon: "window",
    title: "Fenêtres & portes-fenêtres",
    subtitle: "PVC ou aluminium",
  },
  { id: "baies", icon: "bay", title: "Baies vitrées", subtitle: "Coulissantes & galandage" },
  { id: "portes", icon: "door", title: "Portes d'entrée", subtitle: "Sur-mesure" },
  { id: "portails", icon: "gate", title: "Portails & portillons", subtitle: "Aluminium" },
  { id: "clotures", icon: "fence", title: "Clôtures", subtitle: "Brise-vue & brise-vent" },
  { id: "pergolas", icon: "pergola", title: "Pergolas & vérandas", subtitle: "Aluminium" },
  {
    id: "volets",
    icon: "shutter",
    title: "Volets roulants",
    subtitle: "Réparation & dépannage",
  },
  {
    id: "garage",
    icon: "garage",
    title: "Portes de garage",
    subtitle: "Sectionnelles, basculantes ou enroulables",
  },
] as const;

export const realisations = [
  { label: "Fenêtres", slug: "fenetres" },
  { label: "Baies vitrées", slug: "baies-vitrees" },
  { label: "Portails", slug: "portails" },
  { label: "Clôtures", slug: "clotures" },
  { label: "Pergolas & vérandas", slug: "pergolas-verandas" },
  { label: "Portes de garage", slug: "portes-de-garage" },
];
