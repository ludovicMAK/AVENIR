# 🏦 AVENIR Bank - Application Bancaire

Application bancaire moderne construite avec Clean Architecture, permettant la gestion de comptes, virements, crédits, épargne et trading d'actions.

---

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Lancement du Projet](#-lancement-du-projet)
- [Accès à l'Application](#-accès-à-lapplication)
- [Comptes de Test](#-comptes-de-test)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Fonctionnalités](#-fonctionnalités)
- [Base de Données](#-base-de-données)
- [Scripts Disponibles](#-scripts-disponibles)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **npm** (v8 ou supérieur) - Installé avec Node.js
- **Docker** et **Docker Compose** - [Télécharger](https://www.docker.com/products/docker-desktop)
- **Git** - [Télécharger](https://git-scm.com/)

---

## 📦 Installation

### 1. Cloner le Projet

```bash
git clone <url-du-repository>
cd AVENIR
```

### 2. Installer les Dépendances

Le projet utilise npm workspaces. Une seule commande suffit pour installer toutes les dépendances :

```bash
npm install
```

Cette commande installera les dépendances pour :

- Le projet racine
- Le module `domain`
- Le module `application`
- Le backend Express (`infrastructure/express`)
- Le frontend Next.js (`infrastructure/next`)

### 3. Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet (optionnel) :

```env
# Base de données PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=avenir_bank
DB_PORT=5432

# Express API
EXPRESS_PORT=8000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note** : Les valeurs par défaut fonctionnent directement. Ce fichier n'est nécessaire que si vous souhaitez personnaliser la configuration.

---

## 🚀 Lancement du Projet

Le projet nécessite **3 services** pour fonctionner :

### Étape 1 : Démarrer la Base de Données

Dans un premier terminal :

```bash
docker compose up
```

Cette commande va :

- Démarrer PostgreSQL dans un conteneur Docker
- Créer la base de données `avenir_bank`
- Charger automatiquement les **données fictives** (16 utilisateurs, 26 comptes, 15 virements, 10 actions, etc.)
- Démarrer pgAdmin pour l'administration (optionnel)

Attendez que PostgreSQL soit prêt (vous verrez `database system is ready to accept connections`).

### Étape 2 : Démarrer le Backend Express

Dans un second terminal :

```bash
npm run dev:express
```

Le serveur API démarre sur **http://localhost:8000**

### Étape 3 : Démarrer le Frontend Next.js

Dans un troisième terminal :

```bash
npm run dev:next
```

L'application web démarre sur **http://localhost:3000**

---

## 🌐 Accès à l'Application

Une fois les 3 services démarrés :

### Application Web

- **URL** : http://localhost:3000
- Interface utilisateur complète avec authentification

### API Backend

- **URL** : http://localhost:8000
- API RESTful pour toutes les opérations

### Base de Données (pgAdmin)

- **URL** : http://localhost:5050
- **Email** : admin@avenir.com
- **Mot de passe** : admin123

---

## 👤 Comptes de Test

**Tous les comptes utilisent le même mot de passe** : `Admin123!`

### 🏦 Directeur de Banque

```
Email: laurent.dubois@avenir.com
Mot de passe: Admin123!
```

**Privilèges** :

- Gérer les actions (créer, modifier, supprimer)
- Fixer les taux d'épargne
- Voir tous les clients
- Compte avec 500 000€ pour virements tests

---

### 💼 Conseillers Bancaires

```
Email: marie.dupont@avenir.com
Email: pierre.moreau@avenir.com
Email: julie.laurent@avenir.com
Email: marc.simon@avenir.com
Email: emilie.michel@avenir.com
Mot de passe: Admin123! (pour tous)
```

**Privilèges** :

- Octroyer des crédits
- Répondre aux messages clients
- Transférer des conversations

---

### 👥 Clients (exemples)

#### Sophie Bernard - Investisseuse Active

```
Email: sophie.bernard@gmail.com
Mot de passe: Admin123!
```

- 3 comptes (courant 2 800€, épargne 12 000€, trading 25 000€)
- 4 positions boursières (275 actions)
- Ordres actifs d'achat et de vente

#### Jean Martin - Investisseur Débutant

```
Email: jean.martin@gmail.com
Mot de passe: Admin123!
```

- 3 comptes (courant 3 500€, livret A 8 000€, trading 15 000€)
- Crédit de 10 000€ en cours (3/12 mensualités payées)
- Conversation active avec conseiller

#### Luc Petit - Jeune Client avec Crédit

```
Email: luc.petit@gmail.com
Mot de passe: Admin123!
```

- 2 comptes (courant 1 200€, épargne 3 500€)
- Crédit de 5 000€ en cours
- Idéal pour tester les virements

#### Alice Durand - Grande Investisseuse

```
Email: alice.durand@gmail.com
Mot de passe: Admin123!
```

- 3 comptes (courant, épargne, trading)
- Crédit de 50 000€ sur 60 mois
- Gros portefeuille d'actions (~42 000€)

> 📄 **Liste complète** : Voir [DONNEES_FICTIVES.md](./DONNEES_FICTIVES.md) pour tous les comptes de test et scénarios disponibles.

---

## 🏗️ Architecture

Le projet suit les principes de **Clean Architecture** avec une séparation claire des responsabilités :

```
AVENIR/
├── domain/                    # Entités métier et logique pure
│   ├── entities/              # Entités du domaine (User, Account, Transfer, etc.)
│   ├── values/                # Value Objects (AccountType, Role, Status, etc.)
│   └── types/                 # Types TypeScript du domaine
│
├── application/               # Cas d'usage et règles métier
│   ├── usecases/              # Use cases organisés par domaine
│   │   ├── accounts/          # Gestion des comptes
│   │   ├── auth/              # Authentification
│   │   ├── credits/           # Gestion des crédits
│   │   ├── transfer/          # Virements
│   │   └── shares/            # Trading d'actions
│   ├── repositories/          # Interfaces de repositories
│   └── services/              # Interfaces de services
│
└── infrastructure/            # Implémentations techniques
    ├── database/              # Scripts SQL d'initialisation
    │   └── init.sql/          # Données fictives
    │
    ├── express/               # Backend API
    │   ├── controllers/       # Contrôleurs métier
    │   ├── src/
    │   │   ├── http/          # HTTP handlers
    │   │   ├── routes/        # Routes Express
    │   │   ├── middlewares/   # Middlewares (auth, error, etc.)
    │   │   └── db/            # Connexion et migrations
    │   └── server.ts          # Point d'entrée Express
    │
    ├── adaptaters/            # Adaptateurs d'infrastructure
    │   ├── repositories/      # Implémentations PostgreSQL/Memory
    │   └── services/          # Services concrets (Email, Hash, etc.)
    │
    └── next/                  # Frontend Next.js 15
        └── app/               # App Router Next.js
            ├── (auth)/        # Pages d'authentification
            └── dashboard/     # Interface utilisateur
```

### Principes Appliqués

- ✅ **Dependency Inversion** : Les modules de haut niveau ne dépendent pas des détails
- ✅ **Separation of Concerns** : Chaque couche a une responsabilité unique
- ✅ **Testabilité** : Repositories en mémoire pour les tests
- ✅ **Indépendance du Framework** : La logique métier est isolée

---

## 🛠️ Technologies

### Backend

- **Node.js** + **TypeScript** - Runtime et typage
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **node-postgres (pg)** - Driver PostgreSQL
- **bcrypt** - Hachage de mots de passe
- **uuid** - Génération d'identifiants

### Frontend

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas
- **Shadcn UI** - Composants UI

### DevOps

- **Docker** + **Docker Compose** - Conteneurisation
- **npm workspaces** - Gestion monorepo
- **ts-node** - Exécution TypeScript

---

## ✨ Fonctionnalités

### Pour les Clients

#### 💰 Gestion de Comptes

- Consultation des soldes (courant, épargne, trading)
- Historique des transactions
- Téléchargement de relevés
- Gestion du découvert autorisé

#### 🔄 Virements

- Virements entre comptes personnels
- Virements vers d'autres clients
- Historique des virements
- Virements planifiés (en attente de validation)

#### 💳 Crédits

- Simulation de crédit
- Demande de crédit
- Consultation du tableau d'amortissement
- Paiement des échéances
- Remboursement anticipé

#### 📈 Épargne

- Livrets d'épargne avec intérêts
- Consultation des taux
- Historique des intérêts perçus

#### 📊 Trading d'Actions

- Consultation du cours des actions
- Achat et vente d'actions
- Gestion du portefeuille
- Ordres limités (achat/vente à prix fixe)
- Historique des transactions

#### 💬 Messagerie

- Contact avec un conseiller bancaire
- Suivi des conversations
- Notifications de réponses

---

### Pour les Conseillers

- Gestion des conversations clients
- Octroyer des crédits
- Transférer des conversations à un collègue
- Voir l'historique des clients

---

### Pour le Directeur

- Création/modification/suppression d'actions
- Gestion des taux d'épargne
- Vue d'ensemble de tous les clients
- Gestion des utilisateurs
- Virements importants (jusqu'à 500 000€)

---

## 🗄️ Base de Données

### Données Préchargées

Au premier démarrage, la base de données est automatiquement initialisée avec :

- **16 utilisateurs** (1 directeur, 5 conseillers, 10 clients)
- **26 comptes bancaires** (~750 000€ au total)
- **15 virements** (validés, en attente, annulés)
- **35 transactions** (virements, intérêts, salaires, frais)
- **8 crédits** (160 000€ empruntés, 60 échéances)
- **10 actions** disponibles en bourse
- **23 positions** d'investissement
- **30 ordres** (achat/vente)
- **12 conversations** client-conseiller
- **36 messages**

### Réinitialiser la Base de Données

Si vous souhaitez remettre les données à zéro :

```bash
# Arrêter les conteneurs
docker compose down

# Supprimer le volume (⚠️ supprime toutes les données)
docker volume rm avenir_avenir-postgres-data

# Redémarrer (recrée la base avec les données initiales)
docker compose up
```

### Accès Direct à PostgreSQL

```bash
# Via Docker
docker exec -it avenir-postgres psql -U postgres -d avenir_bank

# Exemples de requêtes
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM accounts;
SELECT COUNT(*) FROM transfers;
```

---

## 📜 Scripts Disponibles

### Racine du Projet

```bash
npm install              # Installer toutes les dépendances
npm run dev:express      # Démarrer le backend Express
npm run dev:next         # Démarrer le frontend Next.js
```

### Backend Express (`infrastructure/express`)

```bash
npm run dev              # Mode développement avec hot-reload
npm run build            # Compiler TypeScript
npm start                # Démarrer en production
```

### Frontend Next.js (`infrastructure/next`)

```bash
npm run dev              # Mode développement
npm run build            # Build de production
npm start                # Démarrer en production
npm run lint             # Linter le code
```

### Docker

```bash
docker compose up        # Démarrer PostgreSQL + pgAdmin
docker compose down      # Arrêter les services
docker compose logs      # Voir les logs
docker compose ps        # Voir l'état des services
```

---

## 🧪 Scénarios de Test

### 1. Test Complet Virements

**Compte** : luc.petit@gmail.com / Admin123!

1. Se connecter
2. Aller dans "Virements"
3. Créer un virement de 200€ du compte courant vers l'épargne
4. Consulter l'historique

### 2. Test Complet Trading

**Compte** : sophie.bernard@gmail.com / Admin123!

1. Se connecter
2. Aller dans "Trading"
3. Consulter le portefeuille (4 positions)
4. Placer un ordre d'achat de 10 actions TechNova à 106€
5. Voir les ordres en attente

### 3. Test Complet Crédit

**Compte** : jean.martin@gmail.com / Admin123!

1. Se connecter
2. Aller dans "Crédits"
3. Voir le crédit en cours (10 000€)
4. Consulter le tableau d'amortissement
5. Payer l'échéance du mois (862€)

### 4. Test Gestion Directeur

**Compte** : laurent.dubois@avenir.com / Admin123!

1. Se connecter
2. Créer une nouvelle action
3. Modifier le prix d'une action existante
4. Faire un virement de 10 000€ à un client

---

## 📚 Documentation Complémentaire

- [DONNEES_FICTIVES.md](./DONNEES_FICTIVES.md) - Documentation complète des données de test

---

## 🐛 Dépannage

### Le backend ne démarre pas

Vérifiez que PostgreSQL est bien démarré :

```bash
docker compose ps
```

### Erreur de connexion à la base de données

Attendez que PostgreSQL soit complètement initialisé (environ 10-15 secondes après le démarrage).

### Port déjà utilisé

Si les ports 3000, 8000 ou 5432 sont déjà utilisés, modifiez-les dans le fichier `.env`.

### Les données ne sont pas chargées

Supprimez le volume Docker et redémarrez :

```bash
docker compose down
docker volume rm avenir_avenir-postgres-data
docker compose up
```

---

## 📝 Licence

Ce projet est à usage éducatif.

---

## 👥 Contributeurs

Projet développé dans le cadre du cours de Clean Architecture à l'ESGI.

---

**Bon développement ! 🚀**
