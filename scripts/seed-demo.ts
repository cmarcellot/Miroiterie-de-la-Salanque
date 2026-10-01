/**
 * Données de démo pour tester l'espace pro EN LOCAL (voir README,
 * "Données de démo en local") : npm run seed:demo
 *
 * - Refuse de tourner si MONGODB_URI ne pointe pas vers localhost / 127.0.0.1.
 * - Vide puis réinjecte clients, demandes, devis, factures, chantiers,
 *   catalogue et paramètres : relançable à volonté. Le compte de connexion
 *   (users) est conservé, seules ses notifications "lues" sont remises à zéro.
 * - Tout est daté par rapport à aujourd'hui, avec un tirage pseudo-aléatoire
 *   à graine fixe : chaque exécution produit le même jeu de données.
 */
import fs from "node:fs";
import mongoose from "mongoose";
import Client from "@/lib/models/Client";
import Message from "@/lib/models/Message";
import Devis from "@/lib/models/Devis";
import Facture from "@/lib/models/Facture";
import Chantier from "@/lib/models/Chantier";
import Prestation from "@/lib/models/Prestation";
import Settings from "@/lib/models/Settings";
import User from "@/lib/models/User";
import { site } from "@/lib/site";
import {
  clientDisplayName,
  computeTotals,
  type ChantierStatus,
  type ClientType,
  type DevisStatus,
  type LineItem,
  type MessageStatus,
  type PrestationType,
} from "@/lib/pro-enums";

/* ---------- Garde-fou : base locale uniquement ---------- */

if (!process.env.MONGODB_URI && fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}
const MONGODB_URI = process.env.MONGODB_URI || "";

/** Vrai seulement si tous les hôtes de l'URI sont localhost / 127.0.0.1. */
function isLocalUri(uri: string): boolean {
  // mongodb+srv:// passe forcément par un DNS distant : refusé.
  const m = /^mongodb:\/\/(?:[^@/]*@)?([^/?]+)/.exec(uri.trim());
  if (!m) return false;
  return m[1].split(",").every((h) => {
    const host = h.replace(/:\d+$/, "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  });
}

if (!isLocalUri(MONGODB_URI)) {
  console.error(
    [
      "",
      "ARRÊT : seed-demo ne s'exécute que sur une base MongoDB locale.",
      `MONGODB_URI = ${MONGODB_URI ? MONGODB_URI.replace(/\/\/[^@/]*@/, "//***@") : "(non définie)"}`,
      "Attendu : mongodb://localhost:27017/... ou mongodb://127.0.0.1:27017/...",
      "(voir README, \"Données de démo en local\").",
      "",
    ].join("\n")
  );
  process.exit(1);
}

/* ---------- Aléatoire reproductible ---------- */

let seed = 0x6d647321; // "mds!"
function rand(): number {
  // mulberry32
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const phone = (prefix: string) =>
  `${prefix} ${Array.from({ length: 4 }, () => String(int(10, 99))).join(" ")}`;
const oid = () => new mongoose.Types.ObjectId();

/* ---------- Dates (exprimées en "jours avant aujourd'hui") ---------- */

const now = new Date();
const DAY = 864e5;

/** Horodatage local, `ago` jours avant aujourd'hui, à l'heure donnée (jamais dans le futur). */
function at(ago: number, hour = 10, minute = 0): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ago, hour, minute);
  return d > now ? new Date(now.getTime() - 10 * 60e3) : d;
}
/** Date "jour" telle que saisie dans les formulaires (AAAA-MM-JJ -> minuit UTC). */
function day(ago: number): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ago);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/* ---------- Catalogue ---------- */

type CatItem = {
  type: PrestationType;
  name: string;
  unit: string;
  unitPrice: number;
  vatRate: number;
  description: string;
  active?: boolean;
};

const CATALOGUE = {
  fen2: { type: "produit", name: "Fenêtre PVC 2 vantaux double vitrage", unit: "unité", unitPrice: 690, vatRate: 5.5, description: "Fenêtre PVC blanc, double vitrage 4/20/4 argon, Uw 1,3. Dimensions standard jusqu'à 140 × 125 cm." },
  fen1: { type: "produit", name: "Fenêtre PVC 1 vantail double vitrage", unit: "unité", unitPrice: 480, vatRate: 5.5, description: "Fenêtre PVC oscillo-battante, double vitrage 4/20/4 argon." },
  pf2: { type: "produit", name: "Porte-fenêtre PVC 2 vantaux", unit: "unité", unitPrice: 1090, vatRate: 5.5, description: "Porte-fenêtre PVC avec soubassement, seuil PMR." },
  baie: { type: "produit", name: "Baie coulissante aluminium 2 vantaux", unit: "unité", unitPrice: 2450, vatRate: 5.5, description: "Baie alu à rupture de pont thermique, jusqu'à 240 × 215 cm, coloris au choix." },
  porte: { type: "produit", name: "Porte d'entrée aluminium isolante", unit: "unité", unitPrice: 2290, vatRate: 5.5, description: "Porte alu monobloc, serrure 5 points, Ud 1,1." },
  volet: { type: "produit", name: "Volet roulant aluminium motorisé (posé)", unit: "unité", unitPrice: 560, vatRate: 10, description: "Coffre rénovation, lames alu, moteur filaire, pose comprise." },
  portail: { type: "produit", name: "Portail aluminium battant 2 vantaux", unit: "unité", unitPrice: 2690, vatRate: 10, description: "Portail alu plein ou ajouré, jusqu'à 4 m, coloris RAL au choix." },
  portillon: { type: "produit", name: "Portillon aluminium", unit: "unité", unitPrice: 790, vatRate: 10, description: "Assorti au portail, serrure et gâche électrique en option." },
  motor: { type: "produit", name: "Motorisation de portail à vérins", unit: "unité", unitPrice: 890, vatRate: 10, description: "Kit 2 vérins, 2 télécommandes, feu clignotant et cellules." },
  cloture: { type: "produit", name: "Clôture aluminium brise-vue (posée)", unit: "ml", unitPrice: 145, vatRate: 10, description: "Lames alu occultantes hauteur 1,50 m, poteaux scellés." },
  pergola: { type: "produit", name: "Pergola bioclimatique aluminium", unit: "m²", unitPrice: 490, vatRate: 20, description: "Lames orientables motorisées, éclairage LED intégré." },
  garage: { type: "produit", name: "Porte de garage sectionnelle motorisée", unit: "unité", unitPrice: 1790, vatRate: 10, description: "Panneaux isolés 40 mm, motorisation plafond, 2 télécommandes." },
  rideau: { type: "produit", name: "Rideau métallique motorisé", unit: "m²", unitPrice: 295, vatRate: 20, description: "Lames acier galvanisé, moteur central, commande à clé." },
  vitrage: { type: "produit", name: "Remplacement de double vitrage", unit: "m²", unitPrice: 210, vatRate: 10, description: "Vitrage feuilleté ou retardateur d'effraction, fourni et posé." },
  miroir: { type: "produit", name: "Miroir sur mesure (posé)", unit: "m²", unitPrice: 180, vatRate: 20, description: "Miroir 5 mm, chants polis, collage ou fixation par pattes." },
  pose: { type: "prestation", name: "Pose de menuiserie", unit: "unité", unitPrice: 160, vatRate: 5.5, description: "Pose en rénovation sur dormant existant ou en dépose totale." },
  depose: { type: "prestation", name: "Dépose et évacuation de l'ancienne menuiserie", unit: "unité", unitPrice: 55, vatRate: 5.5, description: "" },
  posePortail: { type: "prestation", name: "Pose de portail et portillon", unit: "forfait", unitPrice: 480, vatRate: 10, description: "Scellement des piliers ou fixation sur piliers existants, réglages." },
  depannage: { type: "prestation", name: "Dépannage volet roulant", unit: "forfait", unitPrice: 95, vatRate: 10, description: "Déplacement et diagnostic, première demi-heure comprise." },
  moteur: { type: "produit", name: "Moteur tubulaire de volet roulant", unit: "unité", unitPrice: 230, vatRate: 10, description: "Moteur filaire ou radio selon installation." },
  serrurerie: { type: "prestation", name: "Main d'œuvre serrurerie", unit: "h", unitPrice: 58, vatRate: 10, description: "" },
  cylindre: { type: "produit", name: "Cylindre de serrure haute sécurité", unit: "unité", unitPrice: 145, vatRate: 10, description: "Cylindre anti-crochetage, 5 clés et carte de propriété." },
  bois: { type: "produit", name: "Fenêtre bois (ancienne gamme)", unit: "unité", unitPrice: 820, vatRate: 5.5, description: "Plus proposée, conservée pour l'historique.", active: false },
} satisfies Record<string, CatItem>;
type CatKey = keyof typeof CATALOGUE;

/* ---------- Types de projets ---------- */

type Tpl = {
  /** Libellé "Type de projet" du formulaire de devis du site. */
  label: string;
  /** Objet quand la demande passe par le formulaire de contact. */
  subject: string;
  lines: () => [CatKey, number][];
  title: (lines: [CatKey, number][]) => string;
  details: string[];
  messages: string[];
  notes?: string[];
};

const n = (lines: [CatKey, number][], ...keys: CatKey[]) =>
  lines.filter(([k]) => keys.includes(k)).reduce((s, [, q]) => s + q, 0);
const half = (a: number, b: number) => int(a * 2, b * 2) / 2;

const TEMPLATES = {
  fenetres: {
    label: "Fenêtres & portes-fenêtres",
    subject: "Remplacement de fenêtres",
    lines: () => {
      const f2 = int(2, 5);
      const f1 = int(0, 2);
      const pf = chance(0.4) ? 1 : 0;
      const l: [CatKey, number][] = [["fen2", f2]];
      if (f1) l.push(["fen1", f1]);
      if (pf) l.push(["pf2", pf]);
      l.push(["pose", f2 + f1 + pf], ["depose", f2 + f1 + pf]);
      return l;
    },
    title: (l) => `Remplacement de ${n(l, "fen2", "fen1", "pf2")} menuiseries PVC`,
    details: [
      "Maison des années 80, fenêtres bois simple vitrage à remplacer",
      "Appartement 3e étage, fenêtres alu d'origine",
      "Villa plain-pied, 5 ouvertures côté rue",
    ],
    messages: [
      "Nous voulons changer nos vieilles fenêtres qui laissent passer l'air, surtout avec la tramontane.",
      "Bonjour, je souhaiterais un devis pour remplacer mes fenêtres, si possible avec la TVA réduite.",
      "Est-il possible de passer prendre les mesures un samedi matin ?",
    ],
    notes: ["Coloris blanc, poignées centrées.", "Vitrage retardateur d'effraction au rez-de-chaussée."],
  },
  baie: {
    label: "Baies vitrées",
    subject: "Baie vitrée coulissante",
    lines: () => [["baie", chance(0.25) ? 2 : 1], ["pose", 1], ["depose", 1]],
    title: (l) => (n(l, "baie") > 1 ? "Pose de 2 baies coulissantes alu" : "Pose d'une baie coulissante alu"),
    details: [
      "Remplacement d'une porte-fenêtre par une baie de 2,40 m",
      "Baie côté terrasse, environ 2,10 × 2,15 m",
    ],
    messages: [
      "Nous aimerions ouvrir davantage le séjour sur la terrasse.",
      "Notre baie actuelle coulisse mal et n'est plus étanche.",
    ],
    notes: ["Coloris gris anthracite RAL 7016 intérieur / extérieur."],
  },
  porte: {
    label: "Portes d'entrée",
    subject: "Porte d'entrée",
    lines: () => [["porte", 1], ["pose", 1], ["depose", 1]],
    title: () => "Remplacement de la porte d'entrée",
    details: ["Porte bois abîmée par le soleil, 90 × 215 cm", "Porte d'entrée vitrée à remplacer par un modèle plus isolant"],
    messages: ["La serrure force et la porte ne ferme plus bien.", "Nous voudrions une porte plus sécurisée."],
    notes: ["Modèle avec imposte vitrée, serrure 5 points."],
  },
  portail: {
    label: "Portails & portillons",
    subject: "Portail aluminium",
    lines: () => {
      const l: [CatKey, number][] = [["portail", 1]];
      if (chance(0.6)) l.push(["portillon", 1]);
      if (chance(0.7)) l.push(["motor", 1]);
      l.push(["posePortail", 1]);
      return l;
    },
    title: (l) => (n(l, "motor") ? "Pose portail alu motorisé" : "Pose portail alu"),
    details: ["Ouverture de 3,50 m entre piliers", "Portail battant 4 m + portillon 1 m"],
    messages: ["Notre portail en fer est rouillé, nous voudrions de l'alu.", "Nous souhaitons aussi le motoriser."],
    notes: ["Coloris RAL 7016, remplissage lames horizontales."],
  },
  cloture: {
    label: "Clôtures",
    subject: "Clôture brise-vue",
    lines: () => [["cloture", half(10, 36)]],
    title: (l) => `Clôture alu brise-vue ${String(n(l, "cloture")).replace(".", ",")} ml`,
    details: ["Environ 25 ml sur muret existant", "Clôture en limite de propriété, côté voisin"],
    messages: ["Nous cherchons une solution brise-vue et brise-vent.", "Le grillage actuel est à remplacer."],
  },
  pergola: {
    label: "Pergolas & vérandas",
    subject: "Pergola bioclimatique",
    lines: () => [["pergola", half(12, 28)]],
    title: (l) => `Pergola bioclimatique ${String(n(l, "pergola")).replace(".", ",")} m²`,
    details: ["Terrasse de 4 × 5 m adossée à la maison", "Pergola autoportée au bord de la piscine"],
    messages: ["Nous voudrions de l'ombre sur la terrasse pour l'été.", "Pergola avec éclairage si possible."],
    notes: ["Prévoir alimentation électrique en attente par le client."],
  },
  volets: {
    label: "Volets roulants",
    subject: "Volets roulants électriques",
    lines: () => [["volet", int(2, 6)]],
    title: (l) => `Pose de ${n(l, "volet")} volets roulants motorisés`,
    details: ["Remplacement de volets battants bois", "Motorisation de toutes les ouvertures du rez-de-chaussée"],
    messages: ["Nous voudrions passer aux volets électriques.", "Les volets manuels sont durs à manœuvrer."],
  },
  depannage: {
    label: "Volets roulants",
    subject: "Dépannage volet roulant",
    lines: () => {
      const l: [CatKey, number][] = [["depannage", 1]];
      if (chance(0.6)) l.push(["moteur", 1]);
      else l.push(["serrurerie", 1]);
      return l;
    },
    title: () => "Dépannage volet roulant",
    details: ["Volet bloqué à mi-hauteur", "Le moteur tourne mais le tablier ne bouge plus"],
    messages: [
      "Le volet de la chambre ne remonte plus, pouvez-vous intervenir rapidement ?",
      "Volet roulant électrique en panne depuis l'orage.",
    ],
  },
  garage: {
    label: "Portes de garage",
    subject: "Porte de garage",
    lines: () => [["garage", 1], ["depose", 1]],
    title: () => "Porte de garage sectionnelle motorisée",
    details: ["Ouverture 2,40 × 2,00 m, porte basculante à remplacer"],
    messages: ["Notre porte basculante est lourde et bruyante, nous voudrions une sectionnelle."],
  },
  rideau: {
    label: "Rideaux métalliques",
    subject: "Rideau métallique",
    lines: () => [["rideau", half(8, 16)], ["serrurerie", int(2, 4)]],
    title: () => "Rideau métallique motorisé",
    details: ["Vitrine de commerce, environ 3 × 3 m"],
    messages: ["Le rideau de la boutique est à changer, il est manuel et très usé."],
    notes: ["Intervention un lundi (jour de fermeture)."],
  },
  vitrage: {
    label: "Plusieurs produits / autre",
    subject: "Vitre cassée",
    lines: () => [["vitrage", half(1.5, 8)], ["serrurerie", int(1, 3)]],
    title: () => "Remplacement de vitrages",
    details: ["Vitrage fêlé sur une porte-fenêtre", "Plusieurs vitrages embués à remplacer"],
    messages: ["Une vitre a été cassée, il faudrait la remplacer rapidement.", "Nos doubles vitrages sont embués."],
  },
  miroir: {
    label: "Plusieurs produits / autre",
    subject: "Miroir sur mesure",
    lines: () => [["miroir", half(1.5, 6)]],
    title: () => "Pose de miroirs sur mesure",
    details: ["Miroir de salle de bain sur toute la largeur du plan vasque", "Mur miroir dans une salle de sport"],
    messages: ["Je cherche un miroir découpé sur mesure avec prises électriques.", "Pouvez-vous poser un grand miroir mural ?"],
  },
  serrure: {
    label: "Plusieurs produits / autre",
    subject: "Serrure à changer",
    lines: () => [["cylindre", int(1, 2)], ["serrurerie", int(1, 2)]],
    title: () => "Remplacement de serrures",
    details: ["Changement des cylindres après perte des clés"],
    messages: ["Nous avons perdu un jeu de clés, nous voudrions changer les serrures."],
  },
} satisfies Record<string, Tpl>;
type TplKey = keyof typeof TEMPLATES;

/* ---------- Clients ---------- */

type ClientSeed = {
  type: ClientType;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  zip: string;
  city: string;
  notes?: string;
  /** Projets de ce client (un devis chacun). */
  projects: TplKey[];
  /** Le premier contact est passé par le site (demande liée). */
  viaSite?: boolean;
  /** Adresses de chantier (syndic, agence...), sinon l'adresse du client. */
  sites?: { street: string; zip: string; city: string }[];
};

const CLIENTS: ClientSeed[] = [
  // Professionnels
  {
    type: "professionnel", firstName: "Sandrine", lastName: "Ferrer", company: "Cabinet Horizon Syndic",
    street: "18 boulevard Clemenceau", zip: "66000", city: "Perpignan",
    notes: "Syndic de copropriété. Bons de commande à rappeler sur chaque facture.",
    projects: ["vitrage", "porte", "depannage", "cloture", "serrure", "vitrage"],
    sites: [
      { street: "Résidence Les Tamaris, 4 avenue de la Côte Vermeille", zip: "66140", city: "Canet-en-Roussillon" },
      { street: "Résidence Le Castillet, 12 rue Foch", zip: "66000", city: "Perpignan" },
      { street: "Résidence Mar i Sol, 7 boulevard du Front de Mer", zip: "66420", city: "Le Barcarès" },
    ],
  },
  {
    type: "professionnel", firstName: "Julien", lastName: "Batlle", company: "Le Comptoir Catalan",
    street: "2 promenade de la Côte Vermeille", zip: "66140", city: "Canet-en-Roussillon",
    notes: "Restaurant, fermé le lundi : intervenir de préférence ce jour-là.",
    projects: ["rideau", "miroir", "vitrage"],
  },
  {
    type: "professionnel", firstName: "Nathalie", lastName: "Roig", company: "Agence Mer & Soleil",
    street: "15 avenue des Corbières", zip: "66420", city: "Le Barcarès",
    notes: "Agence immobilière (gestion locative). Clés à récupérer à l'agence.",
    projects: ["depannage", "fenetres", "serrure", "volets"],
    sites: [
      { street: "9 rue des Flamants Roses", zip: "66420", city: "Le Barcarès" },
      { street: "3 allée des Pins", zip: "66440", city: "Torreilles" },
    ],
  },
  {
    type: "professionnel", firstName: "Marc", lastName: "Pujol", company: "Boulangerie Pujol",
    street: "6 place de la République", zip: "66250", city: "Saint-Laurent-de-la-Salanque",
    projects: ["rideau", "porte"],
  },
  {
    type: "professionnel", firstName: "Céline", lastName: "Arnaud", company: "Camping Les Dunes",
    street: "Chemin de la Mer", zip: "66440", city: "Torreilles",
    notes: "Se présenter à l'accueil du camping, accès chantier par l'entrée de service.",
    projects: ["portail", "cloture", "depannage", "cloture"],
    viaSite: true,
  },
  {
    type: "professionnel", firstName: "Frédéric", lastName: "Gual", company: "SCI Les Agaves",
    street: "41 avenue du Maréchal Joffre", zip: "66000", city: "Perpignan",
    projects: ["fenetres", "baie", "volets"],
  },
  {
    type: "professionnel", firstName: "Anaïs", lastName: "Salvat", company: "Cabinet dentaire Salvat",
    street: "8 rue du Général Leclerc", zip: "66000", city: "Perpignan",
    projects: ["vitrage", "miroir"],
  },
  {
    type: "professionnel", firstName: "Olivier", lastName: "Bosch", company: "Pharmacie de la Salanque",
    street: "22 avenue Jean Jaurès", zip: "66250", city: "Saint-Laurent-de-la-Salanque",
    projects: ["rideau", "porte"],
    viaSite: true,
  },
  // Particuliers
  { type: "particulier", firstName: "Jordi", lastName: "Puig", street: "14 rue des Albères", zip: "66000", city: "Perpignan", projects: ["fenetres", "volets"] },
  { type: "particulier", firstName: "Sophie", lastName: "Martinez", street: "3 avenue de la Méditerranée", zip: "66140", city: "Canet-en-Roussillon", projects: ["baie", "pergola"] },
  { type: "particulier", firstName: "Michel", lastName: "Sanchez", street: "27 chemin de la Salanque", zip: "66250", city: "Saint-Laurent-de-la-Salanque", projects: ["portail", "cloture"] },
  { type: "particulier", firstName: "Anne", lastName: "Vidal", street: "5 rue des Goélands", zip: "66420", city: "Le Barcarès", projects: ["depannage"] },
  { type: "particulier", firstName: "Laurent", lastName: "Bonnet", street: "11 rue du Canigou", zip: "66440", city: "Torreilles", projects: ["pergola", "cloture"] },
  { type: "particulier", firstName: "Isabelle", lastName: "Roca", street: "36 avenue Victor Dalbiez", zip: "66000", city: "Perpignan", projects: ["fenetres", "porte"], notes: "Préfère être contactée par email." },
  { type: "particulier", firstName: "Patrick", lastName: "Fabre", street: "9 impasse des Vignes", zip: "66470", city: "Sainte-Marie-la-Mer", projects: ["garage", "portail"] },
  { type: "particulier", firstName: "Claire", lastName: "Durand", street: "21 rue Saint-Michel", zip: "66140", city: "Canet-en-Roussillon", projects: ["miroir", "vitrage"] },
  { type: "particulier", firstName: "Thierry", lastName: "Camps", street: "4 rue des Oliviers", zip: "66530", city: "Claira", projects: ["portail"] },
  { type: "particulier", firstName: "Émilie", lastName: "Sabaté", street: "17 rue de l'Agly", zip: "66510", city: "Saint-Hippolyte", projects: ["fenetres"] },
  { type: "particulier", firstName: "Vincent", lastName: "Lopez", street: "52 avenue d'Espagne", zip: "66000", city: "Perpignan", projects: ["depannage", "volets"] },
  { type: "particulier", firstName: "Nadia", lastName: "Benali", street: "8 rue des Mimosas", zip: "66430", city: "Bompas", projects: ["baie", "volets"] },
  { type: "particulier", firstName: "Christian", lastName: "Pons", street: "2 allée des Sternes", zip: "66420", city: "Le Barcarès", projects: ["cloture", "portail"] },
  { type: "particulier", firstName: "Hélène", lastName: "Maury", street: "13 rue de la Tramontane", zip: "66440", city: "Torreilles", projects: ["porte", "fenetres"] },
  { type: "particulier", firstName: "Alain", lastName: "Ferrandez", street: "30 rue Arago", zip: "66250", city: "Saint-Laurent-de-la-Salanque", projects: ["fenetres", "volets"] },
  { type: "particulier", firstName: "Julie", lastName: "Moreau", street: "6 chemin du Mas Blanc", zip: "66410", city: "Villelongue-de-la-Salanque", projects: ["pergola", "cloture"] },
  { type: "particulier", firstName: "Denis", lastName: "Castell", street: "19 rue des Palmiers", zip: "66140", city: "Canet-en-Roussillon", projects: ["depannage"] },
  { type: "particulier", firstName: "Marion", lastName: "Estève", street: "25 avenue de la Gare", zip: "66380", city: "Pia", projects: ["serrure", "porte"] },
];

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");

/* ---------- Scénarios datés (jours avant aujourd'hui) ---------- */

type Plan = {
  devis: number;
  status: DevisStatus;
  accept?: number;
  /** Date d'intervention prévue (négatif = dans le futur). */
  planned?: number;
  done?: number;
  facture?: number;
  /** Encaissement ; absent = facture émise non payée. */
  paid?: number;
  annule?: boolean;
};

// Les 4 derniers mois, écrits à la main pour couvrir tous les cas visibles
// dans l'espace pro (retards, devis expirants, chantiers à venir...).
const RECENT: Plan[] = [
  // Factures en retard (échéance à 30 jours dépassée)
  { devis: 115, status: "accepte", accept: 108, planned: 72, done: 70, facture: 69 },
  { devis: 98, status: "accepte", accept: 90, planned: 57, done: 55, facture: 54 },
  { devis: 82, status: "accepte", accept: 75, planned: 41, done: 40, facture: 38 },
  // Factures émises, échéance à venir
  { devis: 72, status: "accepte", accept: 66, planned: 22, done: 20, facture: 19 },
  { devis: 60, status: "accepte", accept: 52, planned: 14, done: 12, facture: 10 },
  { devis: 47, status: "accepte", accept: 40, planned: 8, done: 6, facture: 4 },
  // Payées récemment
  { devis: 78, status: "accepte", accept: 70, planned: 40, done: 38, facture: 37, paid: 31 },
  { devis: 66, status: "accepte", accept: 58, planned: 27, done: 25, facture: 24, paid: 3 },
  { devis: 52, status: "accepte", accept: 44, planned: 18, done: 16, facture: 15, paid: 2 },
  { devis: 38, status: "accepte", accept: 31, planned: 13, done: 11, facture: 11, paid: 6 },
  // Chantiers en cours / planifiés / à planifier (pas encore facturés)
  { devis: 58, status: "accepte", accept: 50, planned: 3 },
  { devis: 43, status: "accepte", accept: 35, planned: 1 },
  { devis: 36, status: "accepte", accept: 29, planned: -6 },
  { devis: 27, status: "accepte", accept: 20, planned: -12 },
  { devis: 21, status: "accepte", accept: 14, planned: -19 },
  { devis: 17, status: "accepte", accept: 10 },
  { devis: 11, status: "accepte", accept: 5 },
  // Envoyés : validité de 90 jours -> expire dans 2 j, dans 1 j, dépassée de 3 j
  { devis: 88, status: "envoye" },
  { devis: 89, status: "envoye" },
  { devis: 93, status: "envoye" },
  { devis: 33, status: "envoye" },
  { devis: 19, status: "envoye" },
  { devis: 6, status: "envoye" },
  { devis: 104, status: "expire" },
  { devis: 49, status: "refuse" },
  { devis: 24, status: "refuse" },
  { devis: 4, status: "brouillon" },
  { devis: 2, status: "brouillon" },
  { devis: 1, status: "brouillon" },
];

const TOTAL_PROJECTS = CLIENTS.reduce((s, c) => s + c.projects.length, 0);

// Historique : depuis début janvier de l'an dernier (au moins 18 mois),
// jusqu'à ~4 mois, réparti régulièrement avec un peu de jitter.
function bulkPlans(count: number): Plan[] {
  const start = new Date(Math.min(
    new Date(now.getFullYear() - 1, 0, 8).getTime(),
    new Date(now.getFullYear(), now.getMonth() - 18, now.getDate()).getTime()
  ));
  const startAgo = Math.round((now.getTime() - start.getTime()) / DAY);
  const endAgo = 125;
  const plans: Plan[] = [];
  let accepted = 0;
  for (let i = 0; i < count; i++) {
    const devis = Math.round(startAgo - (i * (startAgo - endAgo)) / (count - 1)) + (i && i < count - 1 ? int(-4, 4) : 0);
    // 3 devis sur 4 acceptés, à intervalle régulier : du CA presque chaque mois.
    if (i % 4 !== 3) {
      accepted++;
      const accept = devis - int(4, 15);
      const planned = accept - int(12, 40);
      if (accepted === 6) {
        plans.push({ devis, status: "accepte", accept, planned, annule: true });
        continue;
      }
      const done = planned - int(0, 2);
      const facture = done - int(0, 2);
      const paid = facture - pick([0, 1, 3, 6, 10, 14, 20, 27, 33, 41]);
      plans.push({ devis, status: "accepte", accept, planned, done, facture, paid });
    } else {
      plans.push({ devis, status: i % 12 === 11 ? "expire" : "refuse" });
    }
  }
  return plans;
}

/* ---------- Construction des documents ---------- */

type AnyDoc = Record<string, unknown> & { _id: mongoose.Types.ObjectId };

function numberDocs(docs: AnyDoc[], prefix: string, dateKey: string) {
  docs.sort((a, b) => (a[dateKey] as Date).getTime() - (b[dateKey] as Date).getTime());
  const seqByYear = new Map<number, number>();
  for (const d of docs) {
    const year = (d[dateKey] as Date).getFullYear();
    const seq = (seqByYear.get(year) ?? 0) + 1;
    seqByYear.set(year, seq);
    d.year = year;
    d.seq = seq;
    d.number = `${prefix}-${year}-${String(seq).padStart(3, "0")}`;
  }
}

function build() {
  const prestations = Object.values(CATALOGUE as Record<string, CatItem>).map((p) => ({
    _id: oid(),
    ...p,
    active: p.active ?? true,
    createdAt: at(560, 9),
    updatedAt: at(560, 9),
  }));

  // Projets (client + type) répartis sur les créneaux datés.
  const projects = shuffle(
    CLIENTS.flatMap((c, ci) => c.projects.map((tpl) => ({ ci, tpl })))
  );
  const plans = [...RECENT, ...bulkPlans(TOTAL_PROJECTS - RECENT.length)];

  const clientIds = CLIENTS.map(() => oid());
  const emails = CLIENTS.map((c) =>
    c.type === "professionnel"
      ? `${slug(c.firstName)}.${slug(c.lastName)}@${slug(c.company || "").replace(/\./g, "-")}.example.com`
      : `${slug(c.firstName)}.${slug(c.lastName)}@example.com`
  );
  const phones = CLIENTS.map((c) =>
    c.type === "professionnel" ? phone("04 68") : phone(pick(["06", "07"]))
  );
  // Premier projet de chaque client (le plus ancien) : origine de la demande du site.
  const first = CLIENTS.map(() => ({ ago: -1, status: "brouillon" as DevisStatus, tpl: "fenetres" as TplKey }));

  const devisDocs: AnyDoc[] = [];
  const factureDocs: AnyDoc[] = [];
  const chantierDocs: AnyDoc[] = [];

  projects.forEach(({ ci, tpl }, i) => {
    const plan = plans[i];
    const c = CLIENTS[ci];
    const t: Tpl = TEMPLATES[tpl];
    const pro = c.type === "professionnel";
    const email = emails[ci];
    const snap = {
      name: clientDisplayName(c),
      street: c.street,
      zip: c.zip,
      city: c.city,
      email,
      phone: phones[ci],
    };

    if (plan.devis > first[ci].ago) first[ci] = { ago: plan.devis, status: plan.status, tpl };

    const lines = t.lines();
    const items: LineItem[] = lines.map(([k, qty]) => {
      const p: CatItem = CATALOGUE[k];
      // TVA réduite réservée aux logements de particuliers.
      return { label: p.name, qty, unitPrice: p.unitPrice, vatRate: pro ? 20 : p.vatRate };
    });
    const totals = computeTotals(items);
    const devisId = oid();
    const created = at(plan.devis, int(8, 18), int(0, 59));
    const sent = plan.status !== "brouillon";
    const lastChange =
      plan.accept !== undefined
        ? at(plan.accept, int(9, 18))
        : plan.status === "refuse" || plan.status === "expire"
          ? at(Math.max(plan.devis - int(10, 30), 0), 11)
          : created;

    devisDocs.push({
      _id: devisId,
      clientId: clientIds[ci],
      client: snap,
      date: day(plan.devis),
      validUntil: day(plan.devis - 90),
      status: plan.status,
      items,
      ...totals,
      depositPct: 30,
      notes: t.notes && chance(0.5) ? pick(t.notes) : "",
      emailSentAt: sent ? at(plan.devis, 18, 30) : null,
      emailSentTo: sent ? email : "",
      expiryReminderSentAt: null,
      createdAt: created,
      updatedAt: lastChange,
    });

    if (plan.accept === undefined) return;

    const siteAddr = c.sites ? pick(c.sites) : { street: c.street, zip: c.zip, city: c.city };
    const doneStatus: ChantierStatus = plan.annule
      ? "annule"
      : plan.done !== undefined
        ? "termine"
        : plan.planned !== undefined && plan.planned >= 0
          ? "en_cours"
          : plan.planned !== undefined
            ? "planifie"
            : "a_planifier";
    chantierDocs.push({
      _id: oid(),
      clientId: clientIds[ci],
      client: snap,
      devisId,
      title: t.title(lines),
      status: doneStatus,
      plannedDate: plan.planned !== undefined ? day(plan.planned) : undefined,
      completedDate: plan.done !== undefined ? at(plan.done, int(15, 18)) : null,
      ...siteAddr,
      notes: plan.annule
        ? "Annulé par le client (projet reporté)."
        : chance(0.3)
          ? pick(["Prévoir 2 poseurs.", "Accès camion difficile, rue étroite.", "Client absent : clés chez le voisin.", "Vérifier les cotes avant fabrication."])
          : "",
      createdAt: at(plan.accept, int(9, 18)),
      // Dernier changement : fin de chantier, démarrage, ou planification peu après l'acceptation.
      updatedAt: at(
        plan.done ?? (plan.planned !== undefined && plan.planned >= 0 ? plan.planned : Math.max(plan.accept - 2, 0)),
        18
      ),
    });

    if (plan.facture === undefined) return;
    const factureDate = at(plan.facture, 17);
    factureDocs.push({
      _id: oid(),
      clientId: clientIds[ci],
      client: snap,
      devisId,
      date: day(plan.facture),
      dueDate: day(plan.facture - 30),
      status: plan.paid !== undefined ? "payee" : "emise",
      paidAt: plan.paid !== undefined ? at(plan.paid, int(9, 18), int(0, 59)) : null,
      items,
      ...totals,
      // Acompte de 30 % versé à l'acceptation du devis, déduit du net à payer.
      depositAmount: Math.round(totals.totalTTC * 0.3 * 100) / 100,
      depositPaidAt: at(plan.accept, 10),
      notes: "",
      emailSentAt: at(plan.facture, 18),
      emailSentTo: email,
      createdAt: factureDate,
      updatedAt: plan.paid !== undefined ? at(plan.paid, 18) : factureDate,
    });
  });

  // Clients + demandes du site à l'origine du premier projet.
  const clients: AnyDoc[] = [];
  const messages: AnyDoc[] = [];
  CLIENTS.forEach((c, ci) => {
    const email = emails[ci];
    const tel = phones[ci];
    const viaSite = c.viaSite || c.type === "particulier";
    const demandeAgo = first[ci].ago + int(2, 9);
    const clientAgo = viaSite ? demandeAgo - 1 : first[ci].ago + int(1, 5);

    clients.push({
      _id: clientIds[ci],
      type: c.type,
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company ?? "",
      email,
      phone: tel,
      street: c.street,
      zip: c.zip,
      city: c.city,
      notes: c.notes ?? "",
      createdAt: at(clientAgo, int(9, 18), int(0, 59)),
      updatedAt: at(clientAgo, 19),
    });

    if (viaSite) {
      const firstTpl: Tpl = TEMPLATES[first[ci].tpl];
      const fromQuoteForm = chance(0.7);
      const message = fromQuoteForm
        ? [
            `Type de projet : ${firstTpl.label}`,
            `Détails du chantier : ${pick(firstTpl.details)}`,
            `Échéance souhaitée : ${pick(["Au plus vite", "Sous 3 mois", "Sous 6 mois", "Pas pressé"])}`,
            `\n${pick(firstTpl.messages)}`,
          ].join("\n\n")
        : `Bonjour,\n\n${pick(firstTpl.messages)}\n\n${pick(firstTpl.details)}.\n\nMerci d'avance,\n${c.firstName} ${c.lastName}`;
      const status: MessageStatus = first[ci].status === "brouillon" ? "en_cours" : "traite";
      const createdAt = at(demandeAgo, int(7, 22), int(0, 59));
      messages.push({
        _id: oid(),
        name: `${c.firstName} ${c.lastName}`,
        email,
        phone: tel,
        subject: fromQuoteForm ? `Devis — ${firstTpl.label}` : firstTpl.subject,
        zip: c.zip,
        city: c.city,
        message,
        source: fromQuoteForm ? "devis" : "contact",
        status,
        adminNotes:
          status === "en_cours"
            ? "Métré fait, devis en cours de rédaction."
            : pick(["Rappelé, rendez-vous pris pour le métré.", "Visite faite, devis envoyé.", ""]),
        clientId: clientIds[ci],
        createdAt,
        updatedAt: at(clientAgo, 19),
      });
    }
  });

  messages.push(...OTHER_DEMANDES.map(demandeDoc));

  numberDocs(devisDocs, "D", "createdAt");
  numberDocs(factureDocs, "F", "createdAt");
  numberDocs(chantierDocs, "CH", "createdAt");

  return { prestations, clients, messages, devisDocs, factureDocs, chantierDocs };
}

/* ---------- Demandes sans suite commerciale (prospects, spam, hors zone...) ---------- */

type OtherDemande = {
  ago: number;
  name: string;
  city: string;
  zip: string;
  source: "contact" | "devis";
  subject: string;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
};

const OTHER_DEMANDES: OtherDemande[] = [
  // Nouvelles
  { ago: 0, name: "Sébastien Llobet", city: "Canet-en-Roussillon", zip: "66140", source: "devis", subject: "Devis — Baies vitrées", status: "nouveau",
    message: "Type de projet : Baies vitrées\n\nDétails du chantier : Remplacement d'une baie de 3 m par une coulissante 3 vantaux\n\nÉchéance souhaitée : Sous 3 mois\n\n\nMaison de 1998, rez-de-chaussée." },
  { ago: 1, name: "Chloé Barrère", city: "Perpignan", zip: "66000", source: "contact", subject: "Volet roulant bloqué", status: "nouveau",
    message: "Bonjour, le volet roulant électrique de la chambre ne remonte plus depuis ce matin, le moteur fait du bruit mais rien ne bouge. Pouvez-vous passer rapidement ? Merci." },
  { ago: 2, name: "Karim Haddad", city: "Saint-Laurent-de-la-Salanque", zip: "66250", source: "devis", subject: "Devis — Portails & portillons", status: "nouveau",
    message: "Type de projet : Portails & portillons\n\nDétails du chantier : Portail coulissant 4 m + portillon, motorisé\n\nÉchéance souhaitée : Sous 6 mois" },
  // En cours
  { ago: 6, name: "Gérard Soler", city: "Torreilles", zip: "66440", source: "devis", subject: "Devis — Pergolas & vérandas", status: "en_cours",
    adminNotes: "Rappelé, métré prévu la semaine prochaine.",
    message: "Type de projet : Pergolas & vérandas\n\nDétails du chantier : Terrasse de 6 × 4 m exposée plein sud\n\nÉchéance souhaitée : Pas pressé" },
  { ago: 11, name: "Aurélie Font", city: "Le Barcarès", zip: "66420", source: "contact", subject: "Miroir salle de bain", status: "en_cours",
    adminNotes: "Attend les dimensions exactes par email.",
    message: "Bonjour, je voudrais un miroir sur mesure de 160 × 90 cm pour ma salle de bain. Quel serait le prix posé ?" },
  { ago: 17, name: "Paul Grau", city: "Canet-en-Roussillon", zip: "66140", source: "contact", subject: "Porte de hall d'immeuble", status: "en_cours",
    adminNotes: "Syndic bénévole. Visite à caler avec le conseil syndical.",
    message: "Bonjour, je suis syndic bénévole d'une petite copropriété. La porte vitrée du hall ferme mal et la ventouse ne tient plus. Pouvez-vous établir un devis ?" },
  { ago: 26, name: "Stéphanie Carrère", city: "Bompas", zip: "66430", source: "devis", subject: "Devis — Portes de garage", status: "en_cours",
    adminNotes: "Hésite entre sectionnelle et enroulable, rappeler début de mois.",
    message: "Type de projet : Portes de garage\n\nDétails du chantier : Ouverture 2,50 × 2,10 m\n\nÉchéance souhaitée : Sous 3 mois" },
  // Traitées sans devis
  { ago: 45, name: "Jacques Olive", city: "Perpignan", zip: "66000", source: "contact", subject: "Horaires", status: "traite",
    adminNotes: "Répondu par téléphone.",
    message: "Bonjour, êtes-vous ouverts le samedi matin pour passer voir des échantillons ?" },
  { ago: 132, name: "Sylvie Rouch", city: "Pia", zip: "66380", source: "contact", subject: "Délais de fabrication", status: "traite",
    adminNotes: "Délais communiqués (4 à 6 semaines).",
    message: "Bonjour, quels sont vos délais actuels pour des fenêtres PVC ? Merci." },
  { ago: 210, name: "Bernard Coste", city: "Rivesaltes", zip: "66600", source: "devis", subject: "Devis — Fenêtres & portes-fenêtres", status: "traite",
    adminNotes: "Chiffrage donné par téléphone, projet reporté par le client.",
    message: "Type de projet : Fenêtres & portes-fenêtres\n\nDétails du chantier : 3 fenêtres et une porte-fenêtre\n\nÉchéance souhaitée : Pas pressé" },
  { ago: 305, name: "Nathalie Py", city: "Canet-en-Roussillon", zip: "66140", source: "contact", subject: "Moustiquaires", status: "traite",
    adminNotes: "Pas de moustiquaires seules, orientée vers un revendeur.",
    message: "Bonjour, posez-vous des moustiquaires enroulables sur des fenêtres existantes ?" },
  { ago: 420, name: "Fabrice Mas", city: "Claira", zip: "66530", source: "contact", subject: "Garantie porte de garage", status: "traite",
    adminNotes: "Porte posée par un autre installateur, renvoyé vers le fabricant.",
    message: "Bonjour, ma porte de garage a 3 ans et le moteur ne répond plus. Est-elle encore sous garantie ?" },
  // Archivées
  { ago: 38, name: "Kevin Marty", city: "Perpignan", zip: "66000", source: "contact", subject: "Candidature spontanée", status: "archive",
    message: "Bonjour, menuisier poseur avec 5 ans d'expérience (alu et PVC), je me permets de vous proposer ma candidature. CV disponible sur demande." },
  { ago: 97, name: "Léa Martin", city: "Lyon", zip: "69003", source: "contact", subject: "Référencement de votre site", status: "archive",
    message: "Bonjour, votre site pourrait apparaître en première page de Google. Seriez-vous disponible pour un appel de 15 minutes cette semaine ?" },
  { ago: 160, name: "Olivier Petit", city: "Montpellier", zip: "34000", source: "devis", subject: "Devis — Clôtures", status: "archive",
    adminNotes: "Hors zone d'intervention.",
    message: "Type de projet : Clôtures\n\nDétails du chantier : 40 ml de clôture alu\n\nÉchéance souhaitée : Sous 3 mois" },
  { ago: 245, name: "Martine Blanc", city: "Perpignan", zip: "66000", source: "contact", subject: "Store banne", status: "archive",
    adminNotes: "Nous ne posons pas de stores bannes.",
    message: "Bonjour, je souhaiterais faire poser un store banne de 4 m sur ma terrasse." },
  { ago: 330, name: "Alu Sud Distribution", city: "Toulouse", zip: "31000", source: "contact", subject: "Présentation de nos gammes", status: "archive",
    message: "Bonjour, nous distribuons des profilés aluminium pour les professionnels de la menuiserie. Je serais ravi de vous présenter notre catalogue." },
  { ago: 380, name: "Thomas Girard", city: "Sainte-Marie-la-Mer", zip: "66470", source: "devis", subject: "Demande de devis", status: "archive",
    adminNotes: "Client injoignable après 3 relances.",
    message: "Type de projet : Plusieurs produits / autre\n\nÉchéance souhaitée : Au plus vite" },
  { ago: 455, name: "Élodie Sarda", city: "Torreilles", zip: "66440", source: "contact", subject: "Fenêtres", status: "archive",
    adminNotes: "Doublon d'une autre demande.",
    message: "Bonjour, je vous ai déjà écrit la semaine dernière pour mes fenêtres, sans réponse. Merci de me rappeler." },
  { ago: 500, name: "Rachid Amrani", city: "Narbonne", zip: "11100", source: "devis", subject: "Devis — Rideaux métalliques", status: "archive",
    adminNotes: "Hors zone d'intervention.",
    message: "Type de projet : Rideaux métalliques\n\nDétails du chantier : Rideau de 4 m pour un local commercial\n\nÉchéance souhaitée : Au plus vite" },
];

function demandeDoc(d: OtherDemande): AnyDoc {
  // Aujourd'hui : quelques heures plus tôt (jamais dans le futur).
  const createdAt = d.ago === 0 ? new Date(now.getTime() - 2 * 3600e3) : at(d.ago, int(7, 22), int(0, 59));
  return {
    _id: oid(),
    name: d.name,
    email: `${slug(d.name)}@example.com`,
    phone: phone(pick(["06", "07"])),
    subject: d.subject,
    zip: d.zip,
    city: d.city,
    message: d.message,
    source: d.source,
    status: d.status,
    adminNotes: d.adminNotes ?? "",
    clientId: null,
    createdAt,
    updatedAt: d.status === "nouveau" ? createdAt : at(Math.max(d.ago - int(1, 3), 0), 19),
  };
}

/* ---------- Exécution ---------- */

async function main() {
  console.log(`Base locale : ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const data = build();

  await Promise.all([
    Client.deleteMany({}),
    Message.deleteMany({}),
    Devis.deleteMany({}),
    Facture.deleteMany({}),
    Chantier.deleteMany({}),
    Prestation.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  // Les ids "lus" de la cloche visent des documents qui viennent d'être supprimés.
  await User.updateMany({}, { $set: { notificationsReadIds: [] } });

  await Settings.create({
    singleton: "main",
    company: {
      name: site.name,
      phone: site.phone,
      email: site.email,
      street: site.address.street,
      zip: site.address.zip,
      city: site.address.city,
    },
  });
  await Prestation.insertMany(data.prestations);
  await Client.insertMany(data.clients);
  await Message.insertMany(data.messages);
  await Devis.insertMany(data.devisDocs);
  await Facture.insertMany(data.factureDocs);
  await Chantier.insertMany(data.chantierDocs);

  const count = <T extends string>(docs: AnyDoc[], key: string) =>
    docs.reduce<Record<string, number>>((acc, d) => {
      const k = d[key] as T;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  const late = data.factureDocs.filter(
    (f) => f.status === "emise" && (f.dueDate as Date).getTime() < now.getTime()
  ).length;

  console.log("\nDonnées de démo injectées :");
  console.log(`  Catalogue  : ${data.prestations.length}`);
  console.log(`  Clients    : ${data.clients.length}`, count(data.clients, "type"));
  console.log(`  Demandes   : ${data.messages.length}`, count(data.messages, "status"));
  console.log(`  Devis      : ${data.devisDocs.length}`, count(data.devisDocs, "status"));
  console.log(`  Factures   : ${data.factureDocs.length}`, count(data.factureDocs, "status"), `dont ${late} en retard`);
  console.log(`  Chantiers  : ${data.chantierDocs.length}`, count(data.chantierDocs, "status"));
  console.log("\nLancer `npm run dev` puis ouvrir http://localhost:3000/pro");
}

main()
  .catch((err) => {
    console.error("seed-demo a échoué :", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
