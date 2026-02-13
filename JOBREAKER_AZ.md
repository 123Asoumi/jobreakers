# 🚀 Jobreaker : L'Audit de Carrière à l'Ère de la Mutation IA

## 1. La Genèse : L'Idée
**Jobreaker** n'est pas un simple site d'emploi. C'est une réponse à l'incertitude du marché du travail moderne, marqué par la montée en puissance de l'Intelligence Artificielle.

### La Vision
Le projet est né d'un constat simple : la recherche d'emploi traditionnelle est passive et bruitée. Jobreaker transforme cette expérience en un **audit proactif**. L'idée est de donner aux talents une **traçabilité absolue** sur la mutation de leurs métiers, en filtrant les opportunités non seulement par compétences, mais par leur pertinence face à l'évolution technologique.

---

## 2. Conception Technique (The Engine)
Jobreaker repose sur une architecture moderne, légère et performante, privilégiant la réactivité en temps réel.

### La Stack
- **Frontend Core** : HTML5, Vanilla JavaScript (ES6+). Pas de frameworks lourds pour garantir une rapidité d'exécution maximale.
- **Styling** : Tailwind CSS pour un design atomique et responsive.
- **Visuals** : Three.js pour l'arrière-plan immersif (nuage de points dynamique) et Iconify pour une iconographie moderne.
- **Backend (BaaS)** : **Supabase**.
  - **Auth** : Authentification par Magic Link (OTP) pour une friction minimale.
  - **Database** : PostgreSQL pour la gestion des utilisateurs (`users`) et des offres (`job_listings`).
  - **Realtime** : Utilisation des canaux de diffusion de Supabase pour injecter les nouvelles offres sans rafraîchissement de page.
  - **Storage** : Stockage des avatars utilisateurs.

### Algorithme de Matching (Concept)
Bien que simulé dans cette version, le système calcule un `match_score` basé sur la correspondance entre le `target_job` de l'utilisateur et les métadonnées de l'offre.

---

## 3. Expérience Utilisateur (UX)
L'expérience Jobreaker est conçue pour être **immédiate** et **minimaliste**.

### Le Flow Onboarding : "L'Initialisation"
Oubliez les formulaires interminables. L'utilisateur passe par une séquence de "mutations" :
1. **Identification** : Prénom et Email.
2. **Consensus** : Validation du lien magique.
3. **Curation** : Accès direct à un feed personnalisé.

### Le Feed Matinal
Au lieu d'inviter l'utilisateur à chercher, Jobreaker lui sert ses "pépites" chaque matin. L'UX privilégie le **signal sur le bruit**. Les micro-interactions (hover sur les cartes, effets de parallaxe) renforcent le sentiment de produit premium et "vivant".

---

## 4. Interface Utilisateur (UI)
L'esthétique de Jobreaker suit les codes du **"Technical Premium"**.

### Design System
- **Palette de Couleurs** : 
  - `Canvas` (#FAFAFA) pour la pureté.
  - `Black` pour l'autorité et le contraste radical.
  - `BrandPink` (#EC4899) pour la rupture et l'innovation (néon).
- **Typographie** : 
  - `Plus Jakarta Sans` : Moderne et lisible pour le contenu.
  - `Geist` : Inspirée par les éditeurs de code, apportant une touche technique.
- **Grid System** : L'utilisation d'une "Technical Grid" en arrière-plan rappelle l'aspect analytique et structuré du projet.

### Composants Signature
- **Cards** : Bordures subtiles, ombres douces et transitions fluides (Scale-ups).
- **Badges de Match** : Indicateurs visuels immédiats de pertinence (Vert/Jaune).
- **Three.js Background** : Un nuage de points flottant qui symbolise les données en suspension attendant d'être structurées.

---

## 5. Perspectives : Le Futur de Jobreaker
L'étape suivante consiste à connecter Jobreaker à des pipelines d'ingestion de données réelles (`ingest_jobs.js`) utilisant l'IA pour analyser la sémantique des descriptions de postes et prédire le "Risk Index" d'automatisation pour chaque carrière.

> **"Ne craignez pas le changement, auditez-le."**
