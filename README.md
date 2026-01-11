# AVENIR Bank

Application bancaire moderne avec Clean Architecture : comptes, virements, crédits, épargne et trading d'actions.

## Prérequis

- **Node.js** (v18+)
- **Docker**

## Installation

```bash
# 1. Cloner le projet
git clone <url-du-repository>
cd AVENIR

# 2. Installer les dépendances
npm install
```

## Lancement (3 services requis)

**Terminal 1 - Base de données**

```bash
docker compose up
```

**Terminal 2 - Backend API**

```bash
npm run dev:express
# API sur http://localhost:8000
```

**Terminal 3 - Frontend**

```bash
npm run dev:next
# App sur http://localhost:3000
```

## Accès

- **Application** : http://localhost:3000
- **API** : http://localhost:8000
- **pgAdmin** : http://localhost:8080 (avenir.noreply@gmail.com / admin)

## Comptes de Test

**Mot de passe unique** : `Admin123!`

### Directeur

- **laurent.dubois@avenir.com** - Gestion actions, taux épargne, 500k€

### Conseillers

- **marie.dupont@avenir.com** - Octroyer crédits, messagerie

### Clients

- **sophie.bernard@gmail.com** - Trading actif, 4 positions boursières
- **jean.martin@gmail.com** - Crédit 10k€ en cours
- **luc.petit@gmail.com** - Test virements
- **alice.durand@gmail.com** - Gros portefeuille (~42k€)

> Voir [DONNEES_FICTIVES.md](./DONNEES_FICTIVES.md) pour tous les comptes

## Architecture

```
AVENIR/
├── domain/              # Entités métier (User, Account, Transfer, Credit, Share)
├── application/         # Use cases et règles métier
└── infrastructure/
    ├── database/        # PostgreSQL + données fictives
    ├── express/         # Backend API REST
    ├── adaptaters/      # Repositories SQL + Services
    └── next/            # Frontend Next.js 15
```

**Principes** : Dependency Inversion, Separation of Concerns, Testabilité

## Technologies

- **Backend** : Node.js, TypeScript, Express, PostgreSQL
- **Frontend** : Next.js 15, React 19, Tailwind CSS, React Hook Form, Zod
- **DevOps** : Docker Compose, npm workspaces

**Projet ESGI - Clean Architecture**
