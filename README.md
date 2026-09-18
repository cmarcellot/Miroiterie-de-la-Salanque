# Miroiterie de la Salanque

Site de la Miroiterie de la Salanque (menuiserie, serrurerie, vitrerie — Perpignan / La Salanque), en deux volets :

- **Vitrine publique** — présentation de l'entreprise, des prestations, formulaire de devis/contact.
- **Espace pro** (`/pro`) — back-office privé pour gérer l'activité au quotidien.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) pour la vitrine publique
- MongoDB via [Mongoose](https://mongoosejs.com/) (`lib/mongodb.ts`)
- [NextAuth](https://next-auth.org/) (Credentials, JWT) pour l'authentification de l'espace pro
- [Nodemailer](https://nodemailer.com/) (SMTP) pour l'envoi des devis/factures par email
- [pdfkit](https://pdfkit.org/) pour la génération des PDF (imprimable + pièce jointe email)

## Espace pro — modules

- **Demandes** — boîte de réception des formulaires du site (statuts, notes, transformation en fiche client).
- **Clients** — fiches particulier/professionnel, historique devis/factures/chantiers.
- **Devis & Factures** — lignes avec TVA, statuts, PDF, envoi par email (PDF joint), génération de facture depuis un devis accepté.
- **Chantiers** — suivi des chantiers liés à un devis/client (statuts, dates, adresse).
- **Produits & Prestations** — catalogue réutilisable, auto-complétion dans les lignes de devis/factures.
- **Statistiques** — CA encaissé, taux de signature, panier moyen, nouveaux clients (avec comparaison à la période précédente), répartitions devis/chantiers, top clients.
- **Recherche globale** (⌘K) et **notifications** (demandes, factures en retard, devis en attente, etc.).
- **Paramètres** — coordonnées de l'entreprise, mentions légales, valeurs par défaut des devis/factures, identité du compte (prénom/nom affichés dans l'espace pro).

La connexion (`/pro`) se fait par mot de passe seul, dans un modal — pas de compte multiple, un seul compte gérant.

## Développement local

Nécessite Node.js >= 20.9 (voir `engines` dans `package.json`).

```bash
npm install
cp .env.example .env.local   # renseigner au moins MONGODB_URI, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

> Pas d'ESLint configuré : `npm run build` type-vérifie via `tsc` mais ne lint pas. Vérifier les indexations de type `RECORD[x.status]` (caster en type d'énumération si besoin).

## Variables d'environnement

Voir `.env.example` pour le détail. Résumé :

| Variable | Rôle |
| --- | --- |
| `MONGODB_URI` | Connexion à la base MongoDB |
| `NEXTAUTH_SECRET` | Secret de session (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL publique du site, sans slash final |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Amorçage du compte gérant unique au tout premier login |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Envoi des devis/factures par email (SMTP) |

## Déploiement (Dokploy / Nixpacks)

- Build : `npm run build` — Start : `npm start` (port 3000)
- Toutes les variables ci-dessus sont à définir dans Dokploy (Environment)
- Endpoint de santé : `GET /api/health`
- Pas de `package-lock.json` committé : les versions exactes dans `package.json` font foi
