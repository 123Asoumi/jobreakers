# 🚀 Jobreaker - Documentation Technique

**Jobreaker** est une application web moderne d'automatisation de recherche d'emploi ("autopilot"). Elle agrège des offres, personnalise le flux pour l'utilisateur, et fournit des insights de marché en temps réel.

---

## 🏗️ Architecture

Le projet repose sur une architecture **Serverless** légère et performante :

*   **Frontend HTML/JS** : Une Single Page Application (SPA) native sans framework lourd, pour une performance maximale.
*   **Backend & Base de données** : Supabase (PostgreSQL) gère les utilisateurs, les offres d'emploi, et le stockage de fichiers.
*   **Data Ingestion** : Scripts Node.js (`scripts/ingest_jobs.js`) qui consomment l'API Remotive pour alimenter la base.
*   **Realtime** : Les clients écoutent les changements en temps réel via Supabase Realtime (WebSockets).

---

## 🗄️ Modèle de Données (Supabase)

### 1. Table `users`
Stocke les profils candidats.
- `id` (UUID): Identifiant unique.
- `email` (Text): Unique, clé de connexion.
- `target_job` (Text): Métier visé (ex: "Product Designer") - *Clé pour le matching*.
- `location` (Text): Localisation souhaitée.
- `avatar_url` (Text): URL publique de la photo de profil.
- `created_at` (Timestamp).

### 2. Table `job_listings`
Stocke les offres agrégées.
- `title`, `company`, `location`, `salary_range` (Text).
- `tags` (Array): Compétences requises.
- `match_score` (Int): Score de pertinence (simulé pour la démo).
- `url` (Text): Lien vers l'offre originale.
- `description` (Text): Description complète HTML de l'offre.

### 3. Storage `avatars`
Bucket public pour stocker les photos de profil utilisateurs via le dossier `avatars/`.

---

## ⚡ Fonctionnalités Clés

### 1. Onboarding & Auth
- **Wizard** en 3 étapes pour capter le profil (Métier, Localisation).
- **Login** simple par email (lookup dans la table `users`).
- Persistance de session via `localStorage`.

### 2. Feed Intelligent & Matching
- **Algorithme** : `main.js` filtre les offres (`fetchMatchedJobs`) en fonction du `target_job` et `location` de l'utilisateur.
- **Fallback Logic** : Si aucune offre exacte n'est trouvée, le système affiche automatiquement les offres les plus populaires pour éviter un écran vide ("Zero State" géré).
- **Realtime** : L'application écoute les `INSERT` sur `job_listings`. Une nouvelle offre pertinente apparaît instantanément "en haut de pile" avec une animation.

### 3. Insights Dynamiques (Dashboard)
Le dashboard s'adapte au métier de l'utilisateur :
- **Signal du Marché** : Affiche une tendance tech/design pertinente (ex: "IA Générative" pour les devs).
- **Skill Gap** : Suggère une compétence à apprendre.
- **Logique** : Gérée par `updateInsights()` dans `main.js`, mappant des mots-clés de job à des dictionnaires de tendances.

### 4. Vue Détails & Upload
- **Détails** : Affichage immersif de la description complète de l'offre avant redirection.
- **Upload** : Gestion d'upload d'avatar avec prévisualisation immédiate et sauvegarde Supabase Storage.

---

## 🛠️ Installation & Setup

### Pré-requis
- Node.js installé.
- Compte Supabase (URL + Anon Key).

### 1. Configuration Base de Données
Exécutez le script SQL dans `schema.sql` via l'interface Supabase pour créer les tables et les politiques de sécurité (RLS).
*Note : Assurez-vous d'ajouter la politique `UPDATE` pour la table users.*

### 2. Variables d'Environnement
Dans `main.js` et `scripts/ingest_jobs.js`, configurez :
```javascript
const SUPABASE_URL = 'VOTRE_URL';
const SUPABASE_KEY = 'VOTRE_ANON_KEY';
```

### 3. Lancer l'Ingestion (Populate Data)
Pour récupérer de vraies offres :
```bash
node scripts/ingest_jobs.js
```
*Ce script récupère 50 offres récentes via l'API Remotive et les injecte dans Supabase.*

### 4. Lancer l'app
Ouvrez simplement `index.html` dans votre navigateur (ou via Live Server).

---

## 🔮 Roadmap / Améliorations Futures
- **AI Matching** : Remplacer le filtre `ilike` SQL par un vector search (pgvector) pour un matching sémantique.
- **Auth Sécurisée** : Implémenter Supabase Auth (Magic Links) au lieu du simple email lookup.
- **Scraping Avancé** : Ajouter d'autres sources d'offres (LinkedIn, WTTJ) via n8n.
