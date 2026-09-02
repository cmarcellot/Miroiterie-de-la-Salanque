# Miroiterie de la Salanque

Site vitrine (phase 1) puis espace pro (phase 2).

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- MongoDB via Mongoose (`lib/mongodb.ts`)

## Développement local

Nécessite Node.js >= 18.18.

```bash
npm install
cp .env.example .env.local   # renseigner MONGODB_URI
npm run dev
```

## Déploiement (Dokploy / Nixpacks)

- Build : `npm run build` — Start : `npm start` (port 3000)
- Variables d'environnement à définir dans Dokploy : `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Endpoint de santé : `GET /api/health`
