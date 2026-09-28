# Purge des données de test de la base de production

Procédure à suivre **une seule fois**, juste avant la mise en service réelle de l'espace pro, pour supprimer les données saisies pendant les tests (demandes « Test test », devis et factures fictifs…) et que la première vraie facture porte le n° `F-AAAA-001`.

> **Pourquoi ?** En France, la numérotation des factures doit être chronologique et continue, sans trou. Les factures de test doivent donc disparaître **avant** la première vraie facture.

⚠️ **Opération irréversible.** Ne pas sauter l'étape 1 (sauvegarde).

✅ **Réalisée en production le 29/09/2026** (voir « Exécution en production » en fin de document). À ne pas refaire une fois de vraies factures émises.

---

## Ce qui part / ce qui reste

| Collection MongoDB | Contenu | Action |
| --- | --- | --- |
| `messages` | Demandes du site (formulaires contact / devis) | **supprimée** (vidée) |
| `clients` | Fiches clients | **supprimée** (vidée) |
| `devis` | Devis | **supprimée** (vidée) |
| `factures` | Factures | **supprimée** (vidée) |
| `chantiers` | Chantiers | **supprimée** (vidée) |
| `prestations` | Catalogue produits & prestations | **supprimée** (vidée) |
| `settings` | Paramètres entreprise (coordonnées, mentions légales, IBAN, réglages devis/factures, notifications, heure des rappels) | **conservée** |
| `users` | Compte de connexion à l'espace pro | **conservé** — seule la liste des notifications « lues » (`notificationsReadIds`) est remise à vide |

Les collections sont **vidées**, pas supprimées : leurs index (unicité des numéros, etc.) restent en place.

### Vérifié dans le code (septembre 2026)

- **Noms des collections** : les modèles `Message`, `Client`, `Devis`, `Facture`, `Chantier`, `Prestation`, `Settings`, `User` (`lib/models/`) donnent exactement les 8 collections ci-dessus (confirmé sur la base de démo locale ; `Devis` reste bien `devis`).
- **Aucun compteur à remettre à zéro** : le prochain numéro de devis, de facture ou de chantier est calculé à chaque création (`nextNumber()` dans `lib/actions/devis.ts`, `factures.ts`, `chantiers.ts`) en cherchant le plus grand numéro existant **de l'année en cours**, plus 1. Quand il n'y a plus aucun document pour l'année, on repart à `001`. Il n'y a pas de collection « compteurs ».
- **Pas d'autre collection** : les sessions de connexion sont des jetons (JWT) stockés dans le navigateur, pas en base ; aucun fichier n'est stocké en base.

---

## Avant de commencer

- Faire l'opération **juste avant la mise en service**, et ne créer aucun devis / aucune facture pendant qu'elle se déroule.
- Le site peut rester en ligne. Mais si le site public est déjà accessible, une **vraie demande** de client a pu arriver : l'étape 3 affiche la liste des demandes, la regarder avant de supprimer.
- Prévoir 15 minutes.

### Le nom de la base : `test`

Toutes les commandes ci-dessous utilisent la base **`test`** : c'est celle de la production.

Explication : le nom de la base est normalement la partie de `MONGODB_URI` (Dokploy → application du site → onglet **Environment**) située entre `27017/` et `?`. Or l'URI de production n'en contient pas :

```
mongodb://mds:motdepasse@miroiterie-de-la-salanque-mdsdb-sf0n9b:27017/?authSource=admin&directConnection=true
                                                                      ^ rien ici
```

Sans nom de base, l'application (Mongoose) utilise la base par défaut de MongoDB, qui s'appelle `test`. (L'exemple de `.env.example`, avec `/entreprise`, ne correspond donc pas à la production.) Si un jour un nom est ajouté dans l'URI, remplacer `test` par ce nom **partout** dans les commandes ci-dessous, et vérifier avec la commande « Repérer la bonne base » plus bas.

### Ouvrir un terminal dans le conteneur MongoDB

Dans Dokploy : projet → service **MongoDB** (pas l'application) → onglet **General** → bouton **Open Terminal** (le libellé peut varier selon la version de Dokploy ; choisir `bash` ou `sh` si on le demande).

Vérifier que les identifiants administrateur sont disponibles :

```sh
echo "$MONGO_INITDB_ROOT_USERNAME"
```

Cela doit afficher le nom d'utilisateur de la base (le même que dans `MONGODB_URI`). Si la ligne est vide : dans toutes les commandes ci-dessous, remplacer `-u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD"` par `-u NOM_UTILISATEUR -p` (le mot de passe sera alors demandé ; il figure dans `MONGODB_URI` ou dans les identifiants du service MongoDB dans Dokploy).

### Repérer la bonne base (lecture seule)

```sh
mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --quiet --eval 'db.adminCommand({listDatabases:1}).databases.forEach(d => print(d.name + " : " + db.getSiblingDB(d.name).getCollectionNames().join(", ")))'
```

Affiche chaque base avec ses collections. La bonne base est celle qui contient `messages`, `clients`, `devis`, `factures`, `chantiers`, `prestations`, `settings` et `users` (en production : `test`). `admin`, `config` et `local` sont des bases internes de MongoDB, ne pas y toucher.

---

## Étape 1 — Sauvegarde complète (obligatoire)

Dans le terminal du conteneur MongoDB :

```sh
mkdir -p /data/db/sauvegardes
```

```sh
mongodump -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db test --gzip --archive=/data/db/sauvegardes/avant-purge.archive.gz
```

Résultat attendu : une ligne `done dumping test.xxx (N documents)` pour **chacune des 8 collections** (`messages`, `clients`, `devis`, `factures`, `chantiers`, `prestations`, `settings`, `users`).

> Pourquoi `/data/db/sauvegardes` ? C'est le seul dossier du conteneur conservé sur le disque (volume Dokploy) même si le conteneur est recréé. MongoDB ignore ce sous-dossier (testé : redémarrage sans erreur).

### Vérifier la sauvegarde

```sh
ls -lh /data/db/sauvegardes/
```

Le fichier `avant-purge.archive.gz` doit apparaître avec une taille non nulle (quelques dizaines de Ko au moins).

```sh
mongorestore --gzip --archive=/data/db/sauvegardes/avant-purge.archive.gz --dryRun -v --nsInclude="test.*" 2>&1 | grep "bson to restore"
```

Cette commande **ne restaure rien** (`--dryRun`) : elle lit l'archive et doit afficher une ligne `found collection test.xxx bson to restore…` pour chacune des 8 collections.

### Recommandé : garder une copie hors du serveur

La sauvegarde ci-dessus est sur le même serveur que la base. Pour plus de sécurité, en faire une copie ailleurs, au choix :

- **Si une destination S3 est configurée dans Dokploy** : service MongoDB → onglet **Backups** → lancer une sauvegarde manuelle, puis vérifier que le fichier apparaît dans le stockage S3.
- **Si vous avez un accès SSH au serveur** : depuis le serveur, `docker ps` pour trouver le nom du conteneur MongoDB, puis
  `docker cp NOM_DU_CONTENEUR:/data/db/sauvegardes/avant-purge.archive.gz ~/`
  et rapatrier le fichier sur votre PC (par exemple avec `scp`).

### En cas de problème : restaurer

Cette commande remet la base **exactement** dans l'état de la sauvegarde (y compris paramètres et compte) ; tout ce qui a été créé depuis est perdu :

```sh
mongorestore -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --gzip --archive=/data/db/sauvegardes/avant-purge.archive.gz --drop --nsInclude="test.*"
```

Résultat attendu en dernière ligne : `N document(s) restored successfully. 0 document(s) failed to restore.`

---

## Étape 2 — Ouvrir `mongosh` sur la bonne base

Toujours dans le terminal du conteneur MongoDB :

```sh
mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin test
```

L'invite devient `test>`. Vérifier :

```js
db.getName()
```

→ doit afficher `test`.

```js
show collections
```

→ doit lister ces 8 collections (l'ordre peut varier) : `chantiers`, `clients`, `devis`, `factures`, `messages`, `prestations`, `settings`, `users`.

**Si ce n'est pas le cas, s'arrêter** : on n'est pas sur la bonne base. `show dbs` liste les bases existantes ; `exit` pour quitter.

---

## Étape 3 — Comptage avant suppression (à blanc, ne modifie rien)

Nombre de documents par collection :

```js
["messages","clients","devis","factures","chantiers","prestations","settings","users"].forEach(c => print(c.padEnd(12) + db.getCollection(c).countDocuments()))
```

**Noter ces chiffres.** `settings` doit valoir 1 et `users` 1.

Liste des demandes qui vont être supprimées (vérifier qu'aucune n'est une vraie demande de client) :

```js
db.messages.find({}, {_id: 0, createdAt: 1, name: 1, email: 1, subject: 1}).sort({createdAt: 1}).toArray()
```

Liste des factures qui vont être supprimées :

```js
db.factures.find({}, {_id: 0, number: 1, "client.name": 1, totalTTC: 1}).sort({year: 1, seq: 1}).toArray()
```

S'il y a une vraie demande ou une vraie facture dans ces listes : **ne pas continuer**, et en reparler avant.

---

## Étape 4 — Suppression

Revérifier une dernière fois la base :

```js
db.getName()
```

→ `test`. Puis coller les commandes **une par une**, et vérifier après chacune que `deletedCount` correspond au chiffre noté à l'étape 3 :

```js
db.messages.deleteMany({})
```

```js
db.clients.deleteMany({})
```

```js
db.devis.deleteMany({})
```

```js
db.factures.deleteMany({})
```

```js
db.chantiers.deleteMany({})
```

```js
db.prestations.deleteMany({})
```

Chaque commande répond `{ acknowledged: true, deletedCount: N }`.

Enfin, vider la liste des notifications « lues » du compte (elle ne référence plus rien) — **c'est la seule modification** de `users` :

```js
db.users.updateMany({}, {$set: {notificationsReadIds: []}})
```

→ `matchedCount: 1`.

**Ne jamais** toucher à `settings` ni supprimer `users`. Ne pas utiliser `db.dropDatabase()` ni `db.xxx.drop()`.

---

## Étape 5 — Vérification après suppression

Recompter :

```js
["messages","clients","devis","factures","chantiers","prestations","settings","users"].forEach(c => print(c.padEnd(12) + db.getCollection(c).countDocuments()))
```

Attendu : **0** partout, sauf `settings 1` et `users 1`.

Vérifier que le compte et les paramètres sont intacts :

```js
db.users.find({}, {_id: 0, email: 1, firstName: 1, lastName: 1, notificationsReadIds: 1})
```

```js
db.settings.findOne({}, {_id: 0, company: 1, legal: 1})
```

→ l'email du compte, les coordonnées, le SIRET, l'IBAN… doivent être ceux saisis dans l'espace pro.

Quitter `mongosh` :

```js
exit
```

Puis sur le site, dans l'espace pro :

1. Se déconnecter puis **se reconnecter** avec le mot de passe habituel → la connexion doit fonctionner.
2. **Paramètres** → onglets Entreprise, Compte, Devis & factures, Notifications : tout est comme avant.
3. **Paramètres → Données** : Clients 0, Devis 0, Factures 0, Demandes du site 0.
4. Tableau de bord, Demandes, Clients, Devis, Chantiers, Factures, Produits & prestations : vides. La cloche de notifications est vide.

---

## Étape 6 — Numérotation : le prochain numéro sera bien `001`

**Ne pas créer de fausse facture en production** (elle prendrait le n°001).

Le prochain numéro est calculé à partir du plus grand numéro existant pour l'année en cours (voir « Vérifié dans le code » plus haut). Il suffit donc de vérifier qu'il n'existe plus aucun document pour l'année. Dans `mongosh` (étape 2 pour le rouvrir) :

```js
const an = new Date().getFullYear(); print("Devis " + an + " : " + db.devis.countDocuments({year: an}) + " | Factures " + an + " : " + db.factures.countDocuments({year: an}) + " | Chantiers " + an + " : " + db.chantiers.countDocuments({year: an}))
```

Attendu : `0` pour les trois. La prochaine facture sera alors `F-AAAA-001`, le prochain devis `D-AAAA-001`, le prochain chantier `CH-AAAA-001` (AAAA = année de création). La numérotation repart d'elle-même à `001` à chaque nouvelle année.

> Cette procédure a été rejouée à l'identique sur la base de démo locale (voir ci-dessous) : après la purge, la première facture créée a bien reçu le n° `F-2026-001`.

---

## Après la purge

- Garder la sauvegarde `avant-purge.archive.gz` quelques semaines, le temps de s'assurer que tout va bien, puis la supprimer du serveur (`rm /data/db/sauvegardes/avant-purge.archive.gz` dans le terminal du conteneur MongoDB) : elle contient les données de test.
- Ressaisir le catalogue **Produits & prestations** réel.
- Une fois les vraies factures émises, **ne plus supprimer de facture** depuis l'espace pro : supprimer la dernière ferait réattribuer son numéro à la suivante, supprimer une facture plus ancienne créerait un trou dans la numérotation.

---

## Validation locale (29/09/2026)

Procédure rejouée sur la base de démo locale (`mds-demo`, MongoDB 8 dans Docker, voir README « Données de démo en local ») avec exactement les mêmes commandes, sans l'authentification (la base locale n'a pas de mot de passe) :

- Sauvegarde `mongodump` dans `/data/db/sauvegardes/` : 8 collections sauvegardées, redémarrage de MongoDB sans erreur avec ce dossier.
- Comptage avant : messages 40, clients 26, devis 58, factures 31, chantiers 39, prestations 23, settings 1, users 1.
- Suppression : `deletedCount` identiques aux comptages ; `notificationsReadIds` remis à `[]`.
- Après : 0 partout sauf settings 1 et users 1 ; index conservés (ex. 6 sur `factures`).
- Espace pro local : connexion OK, Paramètres intacts, onglet Données à 0 ; une facture créée ensuite a reçu le n° **`F-2026-001`**.
- Restauration `mongorestore --drop` depuis l'archive : les 219 documents et les index sont revenus.

## Exécution en production (29/09/2026)

Réalisée par Camille depuis le terminal du conteneur MongoDB dans Dokploy, base `test` :

- Sauvegarde : `/data/db/sauvegardes/avant-purge.archive.gz` (4,5 Ko), 8 collections.
- Supprimé : messages 5, clients 7, devis 7, factures 3 (`F-2026-001` à `F-2026-003`), chantiers 1, prestations 4. Toutes les demandes ont été vérifiées une par une et confirmées comme des tests.
- Conservé : settings 1, users 1 (`notificationsReadIds` remis à `[]`).
- Après : 0 document pour 2026 en devis, factures et chantiers ; connexion, Paramètres et onglet Données vérifiés dans l'espace pro.
- Prochaine facture : `F-2026-001`.
