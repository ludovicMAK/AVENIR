# 🏦 AVENIR - Banking Application

**Alliance de Valeurs Économiques et Nationales Investies Responsablement**

Une plateforme bancaire moderne développée en Clean Architecture avec TypeScript.

---

## 📋 Table des Matières

- [Introduction](#-introduction)
- [Spécifications Fonctionnelles](#-spécifications-fonctionnelles)
- [Architecture du Projet](#-architecture-du-projet)
- [État d'Implémentation](#-état-dimplémentation)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Technologies Utilisées](#-technologies-utilisées)
- [Structure de la Base de Données](#-structure-de-la-base-de-données)

---

## 📖 Introduction

La banque AVENIR est une plateforme bancaire moderne permettant à ses clients de gérer efficacement leurs liquidités, épargne et investissements. Ce projet a été développé en suivant les principes de **Clean Architecture** et **Clean Code** de Robert C. Martin (Uncle Bob).

### Contraintes Techniques

- **Langage** : TypeScript (backend et frontend)
- **Clean Architecture** : Séparation stricte Domain/Application/Infrastructure
- **2 adaptateurs de base de données** : PostgreSQL (production) + InMemory (tests)
- **2 frameworks backend** : Express.js (API REST) + Next.js API Routes
- **Clean Code** : Respect des principes SOLID, fonctions courtes, nommage explicite

---

## 📋 Spécifications Fonctionnelles

### 👤 **CLIENT**

#### **Authentification**

En tant que client, je dois pouvoir m'inscrire sur cette nouvelle plateforme. Je dois pouvoir renseigner mes informations afin de recevoir un lien me permettant de confirmer mon inscription et accéder à mon compte (qui sera automatiquement créé à l'inscription).

**Fonctionnalités** :

- Inscription avec confirmation par email
- Création automatique du premier compte à l'inscription
- Connexion sécurisée

#### **Comptes**

En tant que client, je dois pouvoir disposer d'autant de comptes que je le souhaite. Ainsi, un nouvel IBAN unique et valide mathématiquement doit être généré chaque fois que je crée un compte. Je dois pouvoir supprimer le compte, et modifier son nom personnalisé si je le souhaite.

**Fonctionnalités** :

- Créer un compte (checking ou savings)
- Génération automatique d'IBAN unique et mathématiquement valide
- Renommer un compte (nom personnalisé)
- Supprimer un compte (si solde = 0 et aucune transaction en attente)
- Consulter le solde (somme des opérations de débit et crédit)
- Consulter les transactions avec filtres et pagination
- Générer un relevé de compte sur une période

#### **Opérations**

En tant que client, je dois pouvoir effectuer des opérations courantes, tel qu'un transfert d'un compte à un autre (uniquement au sein de notre banque). Le solde d'un compte doit refléter la somme des opérations de débit (sortant du compte, entrant dans un autre) et de crédit (entrant vers le compte, en provenance d'un autre compte).

**Fonctionnalités** :

- Créer un transfert entre comptes AVENIR
- Vérification du solde disponible (incluant découvert autorisé)
- Consulter l'historique des transferts

#### **Épargne**

En tant que client, je dois pouvoir ouvrir un compte d'épargne. Celui-ci doit pouvoir me permettre, comme pour un compte, d'effectuer des opérations entrantes et sortantes. Néanmoins, ce dernier sera rémunéré tous les jours, au taux en vigueur (fixé par les administrateurs de la banque).

**Fonctionnalités** :

- Ouvrir un compte d'épargne (type `savings`)
- Effectuer des opérations entrantes et sortantes (via transferts)
- Rémunération quotidienne au taux en vigueur ⚠️ **Non implémenté**

#### **Investissement**

En tant que client, je dois pouvoir enregistrer des ordres d'achat ou de vente d'une action. Une action est un titre financier d'appartenance à une entreprise côté sur un marché financier. La liste des actions disponibles est définie par le directeur de la banque. Le cours est calculé en fonction du prix d'équilibre entre un prix de vente et un prix d'achat, selon le carnet d'ordre global pour une action. Étant donné que nous sommes une banque moderne, nous n'avons pas de frais d'arbitrage. Les seuls frais sont de 1€ à l'achat, comme à la vente.

**Fonctionnalités** :

- Consulter la liste des actions disponibles
- Passer un ordre d'achat ou de vente (ordre limité avec prix)
- Blocage des fonds (achat) ou titres (vente)
- Frais fixes : 1€ à l'achat et 1€ à la vente
- Consulter mes ordres (pending, executed, cancelled)
- Annuler un ordre en attente
- Consulter mon portefeuille (positions détenues)
- Consulter le carnet d'ordres d'une action
- Consulter l'historique des transactions d'une action
- Calcul automatique du prix d'équilibre (matching buy/sell)

---

### 👑 **DIRECTEUR DE BANQUE**

#### **Authentification**

En tant que directeur de banque, je dois pouvoir m'authentifier.

**Fonctionnalités** :

- Connexion sécurisée avec rôle `bankManager`

#### **Gestion des comptes**

En tant que directeur de banque, je dois pouvoir créer, modifier ou supprimer un compte client ou le bannir.

**Fonctionnalités** :

- Consulter la liste des utilisateurs ✅
- Créer, modifier ou supprimer un compte client ⚠️ **Non implémenté**
- Bannir/débannir un utilisateur ⚠️ **Non implémenté**

#### **Fixation du taux d'épargne**

En tant que directeur de la banque, je dois pouvoir effectuer une modification du taux d'épargne disponible pour les comptes d'épargne. Ce faisant, tous les clients ayant actuellement un compte d'épargne doivent avoir une notification en ce qui concerne le changement du taux qui a été fixé lors de la modification.

**Fonctionnalités** :

- Modifier le taux d'épargne ⚠️ **Non implémenté**
- Notification automatique aux clients avec compte épargne ⚠️ **Non implémenté**

#### **Actions**

En tant que directeur de banque, je suis celui qui créé, modifie et supprime les actions. Je n'ai pas la possibilité de modifier le cours d'une action, mais c'est moi qui décide quelles sont les actions disponibles de celles qui ne le sont pas. Les clients sont propriétaires de leur actions, contrairement à certains de nos concurrents qui ne le disent pas, nous l'affichons fièrement.

**Fonctionnalités** :

- Créer une action (nom, symbole, nombre total de parts) ✅
- Modifier une action (nom, symbole, total parts) ✅
- Supprimer une action (si aucun ordre actif et aucun client ne la possède) ✅
- Interface admin pour gérer les actions ✅ (`/dashboard/admin/shares`)
- ⚠️ Le cours est calculé automatiquement (pas de modification manuelle)
- Activer/désactiver une action ⚠️ **Non implémenté**

---

### 🧑‍💼 **CONSEILLER BANCAIRE**

#### **Authentification**

En tant que conseiller bancaire, je peux m'authentifier.

**Fonctionnalités** :

- Connexion sécurisée avec rôle `bankAdvisor`

#### **Crédit**

En tant que conseiller bancaire, je peux être amené à octroyer des crédits. Un crédit a un taux annuel d'intérêts à rembourser sur le capital restant chaque mois, une assurance (obligatoire) à un taux dont le montant est calculé sur le total du crédit accordé et prélevé sur les mensualités, et des mensualités qui correspondent au montant du crédit remboursé chaque mois. Nous utilisons la méthode de calcul du crédit à mensualité constante.

**Fonctionnalités** :

- Octroyer un crédit ✅
  - Taux d'intérêt annuel (sur capital restant)
  - Assurance obligatoire (taux sur total du crédit)
  - Mensualités constantes (méthode amortissement français)
  - Génération automatique de l'échéancier
- Simuler un échéancier d'amortissement ✅
- Consulter les crédits d'un client avec échéances ✅
- Consulter l'historique des paiements d'un crédit ✅
- Payer une échéance (prélèvement automatique sur compte) ✅
- Remboursement anticipé total ou partiel ✅
- Marquer les échéances en retard (CRON quotidien) ✅
- Consulter les échéances impayées ✅
- Interface conseiller pour gérer les crédits ⚠️ **Non implémenté (frontend)**

#### **Messagerie instantanée**

En tant que conseiller bancaire, je peux répondre aux messages qui me sont envoyés de la part de mes clients, étant donné que nous sommes une banque moderne, chaque fois qu'un message est envoyé et en attente de réponse, tous les conseillers peuvent le voir, néanmoins à partir du premier message, la discussion est reliée au conseiller bancaire qui a répondu en premier au client. En cas de besoin, la discussion peut être transférée d'un conseiller à un autre, auquel cas le transfert de la discussion se fait entre les deux conseillers.

**Fonctionnalités** :

- Créer une conversation (client → conseiller) ✅
- Envoyer un message (temps réel via WebSocket) ✅
- Consulter les messages d'une conversation ✅
- Système de file d'attente : toutes les conversations sans conseiller sont visibles par tous ✅
- Attribution automatique : le premier conseiller qui répond devient l'interlocuteur ✅
- Transférer une conversation à un autre conseiller ✅
- Fermer une conversation ✅
- Conversations de groupe (multi-participants) ✅
- Ajouter un participant à une conversation ✅
- Interface messagerie ⚠️ **Non implémenté (frontend)**

---

## 🏗️ Architecture du Projet

```
AVENIR/
├── domain/                    # Couche Domain (entités, value objects, types)
│   ├── entities/              # 16 Entités métier pures
│   │   ├── users.ts
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── transfer.ts
│   │   ├── credit.ts
│   │   ├── dueDate.ts
│   │   ├── share.ts
│   │   ├── order.ts
│   │   ├── shareTransaction.ts
│   │   ├── securitiesPosition.ts
│   │   ├── conversation.ts
│   │   ├── message.ts
│   │   ├── participantConversation.ts
│   │   ├── transferConversation.ts
│   │   ├── emailConfirmationToken.ts
│   │   └── session.ts
│   ├── values/                # Value Objects
│   │   ├── role.ts            # customer | bankAdvisor | bankManager
│   │   ├── accountType.ts     # checking | savings
│   │   ├── statusAccount.ts
│   │   ├── statusTransaction.ts
│   │   ├── statusTransfer.ts
│   │   ├── creditStatus.ts
│   │   ├── dueDateStatus.ts
│   │   ├── orderStatus.ts
│   │   ├── orderDirection.ts
│   │   ├── conversationStatus.ts
│   │   └── ...
│   ├── types/                 # Types métier
│   └── errors/                # Erreurs métier
│
├── application/               # Couche Application (Use Cases)
│   ├── usecases/
│   │   ├── users/             # 6 use cases
│   │   ├── accounts/          # 8 use cases
│   │   ├── transactions/      # 3 use cases
│   │   ├── transfer/          # 2 use cases
│   │   ├── credits/           # 10 use cases
│   │   ├── shares/            # 13 use cases
│   │   └── conversations/     # 9 use cases
│   ├── repositories/          # Interfaces des repositories
│   ├── services/              # Interfaces des services
│   └── requests/              # DTOs de requêtes
│
└── infrastructure/            # Couche Infrastructure (Adaptateurs)
    ├── adaptaters/
    │   ├── repositories/      # Implémentations (PostgreSQL + InMemory)
    │   │   ├── postgresql/
    │   │   └── inMemory/
    │   └── services/          # Services externes
    │       ├── NodemailerEmailSender.ts
    │       ├── BcryptPasswordHasher.ts
    │       ├── JWTTokenGenerator.ts
    │       ├── IBANGenerator.ts
    │       └── ...
    │
    ├── express/               # Backend Express
    │   ├── src/
    │   │   ├── http/          # HTTP Handlers
    │   │   ├── routes/        # Routes API
    │   │   ├── middleware/    # Middlewares (auth, roles)
    │   │   ├── socket/        # WebSocket (messagerie temps réel)
    │   │   ├── db/            # Migrations SQL
    │   │   └── config/        # Configuration et DI
    │   └── controllers/       # Controllers
    │
    └── next/                  # Frontend Next.js 15
        ├── app/
        │   ├── auth/          # Pages d'authentification
        │   └── dashboard/     # Interface utilisateur
        │       ├── accounts/  # Gestion des comptes ✅
        │       ├── transfers/ # Transferts ⚠️ (partiel)
        │       ├── investments/ # Investissements ⚠️ (marché uniquement)
        │       └── admin/     # Interface directeur ✅
        ├── api/               # Client API
        ├── hooks/             # React Hooks
        ├── lib/               # Utilitaires
        └── components/        # Composants UI (shadcn/ui)
```

---

## 📊 État d'Implémentation

### ✅ **BACKEND (Express) - 51 Use Cases Implémentés**

| Module            | Use Cases | Routes HTTP                                                                                    | Statut                |
| ----------------- | --------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| **Users**         | 6/6       | ✅ Register, Login, Confirm, List, Me, GetById                                                 | **✅ Complet**        |
| **Accounts**      | 8/8       | ✅ Create, List, GetById, UpdateName, Close, Balance, Transactions, Statement                  | **✅ Complet**        |
| **Transactions**  | 3/3       | ✅ Create, History, GetByAccountIBAN                                                           | **✅ Complet**        |
| **Transfers**     | 2/2       | ✅ Validate, Cancel                                                                            | **✅ Complet**        |
| **Credits**       | 10/10     | ✅ Grant, Simulate, List, Status, PayHistory, Pay, EarlyRepay, MarkOverdue, Overdue, MyCredits | **✅ Complet**        |
| **Shares**        | 13/13     | ✅ CRUD, PlaceOrder, CancelOrder, MyOrders, Positions, Execute, Price, OrderBook, History      | **✅ Complet**        |
| **Conversations** | 9/9       | ✅ Create, Group, Send, Messages, Transfer, Close, AddParticipant, GetConversations            | **✅ Complet**        |
| **Épargne**       | 0/6       | ❌                                                                                             | **❌ Non implémenté** |

**Routes principales** :

- `POST /users/register` - Inscription
- `POST /login` - Connexion
- `GET /users/confirm-registration` - Confirmation email
- `POST /accounts` - Créer un compte
- `GET /accounts/:accountId` - Détail compte
- `GET /accounts/:accountId/balance` - Solde détaillé
- `GET /accounts/:accountId/transactions` - Transactions paginées
- `GET /accounts/:accountId/statement` - Relevé de compte
- `POST /transaction` - Créer un transfert
- `PATCH /transfers/validate` - Valider un transfert (admin)
- `PATCH /transfers/cancel` - Annuler un transfert (admin)
- `GET /transactions/history` - Historique transactions
- `POST /shares` - Créer une action (directeur)
- `PUT /shares/:id` - Modifier une action (directeur)
- `DELETE /shares/:id` - Supprimer une action (directeur)
- `POST /orders` - Passer un ordre
- `DELETE /orders/:orderId` - Annuler un ordre
- `GET /my-orders` - Mes ordres
- `GET /positions` - Mon portefeuille
- `GET /shares/:shareId/order-book` - Carnet d'ordres
- `GET /shares/:shareId/transactions` - Historique transactions action
- `POST /shares/:shareId/execute-matching` - Exécuter les ordres
- `GET /shares/:shareId/price` - Prix d'équilibre
- `POST /credits/grant` - Octroyer un crédit (conseiller)
- `POST /credits/simulate-schedule` - Simuler échéancier
- `GET /my-credits` - Mes crédits
- `POST /due-dates/:dueDateId/pay` - Payer une échéance
- `POST /credits/:creditId/early-repayment` - Remboursement anticipé
- `POST /conversations` - Créer une conversation
- `POST /conversations/messages` - Envoyer un message
- `POST /conversations/transfer` - Transférer une conversation
- `GET /conversations/:conversationId/messages` - Messages conversation

---

### ✅ **FRONTEND (Next.js) - Implémentation Complète**

| Module             | Pages                                 | API Client              | Hooks                                  | Statut         |
| ------------------ | ------------------------------------- | ----------------------- | -------------------------------------- | -------------- |
| **Auth**           | ✅ Login, Register                    | ✅                      | ✅ useCurrentUser                      | **✅ Complet** |
| **Dashboard**      | ✅ Vue d'ensemble                     | ✅                      | ✅                                     | **✅ Complet** |
| **Accounts**       | ✅ Liste, Détail, Création, Statement | ✅ accountsApi          | ✅ useAccounts, useAccountTransactions | **✅ Complet** |
| **Transfers**      | ✅ Historique, Nouveau transfert      | ✅ transfersApi         | ✅ useTransfers                        | **✅ Complet** |
| **Investments**    | ✅ Marché, Ordres, Portefeuille       | ✅ sharesApi, ordersApi | ✅ useShares, useOrders                | **✅ Complet** |
| **Admin (Shares)** | ✅ Gestion actions CRUD               | ✅                      | ✅                                     | **✅ Complet** |
| **Credits**        | ✅ Liste, Détail, Simulateur          | ✅ creditsApi           | ✅ useCredits                          | **✅ Complet** |
| **Messages**       | ✅ Liste, Chat WebSocket              | ✅ conversationsApi     | ✅ useConversations                    | **✅ Complet** |

#### **Pages Implémentées** ✅

**Authentification** :

- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/auth/confirm` - Confirmation email

**Dashboard** :

- `/dashboard` - Vue d'ensemble (liste comptes, soldes)

**Comptes** :

- `/dashboard/accounts` - Liste de mes comptes
- `/dashboard/accounts/new` - Créer un compte
- `/dashboard/accounts/[id]` - Détail compte + transactions
- `/dashboard/accounts/[id]/statement` - Relevé de compte

**Transferts** :

- `/dashboard/transfers` - Historique des transferts
- `/dashboard/transfers/new` - Créer un transfert

**Investissements** :

- `/dashboard/investments/market` - Marché (liste actions)
- `/dashboard/investments/market/[shareId]` - Détail action + carnet d'ordres + passer ordre ✅
- `/dashboard/investments/orders` - Liste mes ordres (pending/executed/cancelled) + annuler ✅
- `/dashboard/investments/portfolio` - Mon portefeuille détaillé (positions, valeur totale) ✅

**Crédits** :

- `/dashboard/credits` - Liste mes crédits + échéancier ✅
- `/dashboard/credits/[id]` - Détail crédit + tableau amortissement + paiement échéance ✅
- `/dashboard/credits/simulator` - Simulateur d'emprunt ✅

**Messagerie** :

- `/dashboard/messages` - Liste conversations ✅
- `/dashboard/messages/[id]` - Interface chat temps réel (WebSocket) ✅

**Admin (Directeur)** :

- `/dashboard/admin/shares` - Gestion des actions (CRUD)

---

## 🚀 Installation et Démarrage

### **Prérequis**

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### **1. Cloner le projet**

```bash
git clone <repository-url>
cd AVENIR
```

### **2. Installer les dépendances**

```bash
# Installation globale (root)
npm install

# Installation backend Express
cd infrastructure/express
npm install

# Installation frontend Next.js
cd ../next
npm install
```

### **3. Configuration**

Créer un fichier `.env` à la racine de chaque module :

**infrastructure/express/.env** :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/avenir
PORT=8000
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
```

**infrastructure/next/.env.local** :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **4. Initialiser la base de données**

```bash
cd infrastructure/express
npm run migrate  # Exécuter les migrations SQL
```

### **5. Démarrer l'application**

**Terminal 1 - Backend Express** :

```bash
npm run dev:express
# API disponible sur http://localhost:8000
```

**Terminal 2 - Frontend Next.js** :

```bash
npm run dev:next
# Interface disponible sur http://localhost:3000
```

### **6. Tester l'API (Postman)**

Une collection Postman est disponible dans `/postman` :

- `AVENIR_Collection.postman_collection.json`
- `AVENIR_Environment.postman_environment.json`

Importer ces fichiers dans Postman pour tester les endpoints.

---

## 🛠️ Technologies Utilisées

### **Backend**

- **Express.js** : Framework web minimaliste
- **TypeScript** : Typage statique
- **PostgreSQL** : Base de données relationnelle
- **Socket.IO** : WebSocket pour messagerie temps réel
- **Nodemailer** : Envoi d'emails
- **bcrypt** : Hachage des mots de passe
- **jsonwebtoken** : Authentification JWT

### **Frontend**

- **Next.js 15** : Framework React avec App Router
- **React 19** : Bibliothèque UI
- **shadcn/ui** : Composants UI (Radix + Tailwind)
- **TailwindCSS** : Framework CSS utility-first
- **Zod** : Validation de schémas
- **React Hook Form** : Gestion de formulaires
- **date-fns** : Manipulation de dates

### **Architecture**

- **Clean Architecture** : Séparation stricte des couches (Domain/Application/Infrastructure)
- **Dependency Injection** : Inversion de dépendances
- **Repository Pattern** : Abstraction de la persistance
- **Use Case Pattern** : Encapsulation de la logique métier
- **Value Objects** : Objets immuables pour les concepts métier

---

## 🗄️ Structure de la Base de Données

### **Tables Principales**

| Table                         | Description                                     | Statut |
| ----------------------------- | ----------------------------------------------- | ------ |
| **users**                     | Utilisateurs (clients, conseillers, directeurs) | ✅     |
| **email_confirmation_tokens** | Tokens de confirmation email                    | ✅     |
| **sessions**                  | Sessions utilisateur (JWT)                      | ✅     |
| **accounts**                  | Comptes bancaires (checking, savings)           | ✅     |
| **transactions**              | Transactions bancaires                          | ✅     |
| **transfers**                 | Transferts entre comptes                        | ✅     |
| **credits**                   | Crédits accordés                                | ✅     |
| **due_dates**                 | Échéances de crédit                             | ✅     |
| **shares**                    | Actions disponibles                             | ✅     |
| **orders**                    | Ordres d'achat/vente                            | ✅     |
| **share_transactions**        | Historique des transactions d'actions           | ✅     |
| **securities_positions**      | Portefeuilles clients (positions détenues)      | ✅     |
| **conversations**             | Conversations client-conseiller                 | ✅     |
| **messages**                  | Messages de conversation                        | ✅     |
| **participant_conversations** | Participants aux conversations                  | ✅     |
| **transfer_conversations**    | Historique des transferts de conversations      | ✅     |

### **Schéma ERD (Relations principales)**

```
users (1) ──→ (N) accounts
users (1) ──→ (N) credits (customer)
users (1) ──→ (N) credits (advisor)
users (1) ──→ (N) orders
users (1) ──→ (N) securities_positions
users (1) ──→ (N) conversations (customer)
users (1) ──→ (N) participant_conversations (advisor)

accounts (1) ──→ (N) transactions
accounts (2) ──→ (1) transfers (source + destination via transactions)

credits (1) ──→ (N) due_dates

shares (1) ──→ (N) orders
shares (1) ──→ (N) share_transactions
shares (1) ──→ (N) securities_positions

conversations (1) ──→ (N) messages
conversations (1) ──→ (N) participant_conversations
conversations (1) ──→ (N) transfer_conversations
```

---

## 📝 Use Cases Implémentés (Détail)

### **Users (6)** ✅

1. `registerUser` - Inscription avec envoi email confirmation
2. `confirmRegistration` - Confirmation via token email
3. `loginUser` - Connexion avec JWT
4. `getUserByToken` - Récupération utilisateur par token
5. `getUserById` - Récupération par ID
6. `getAllUsers` - Liste tous les utilisateurs (admin)

### **Accounts (8)** ✅

1. `createAccount` - Créer un compte (checking/savings) avec IBAN unique
2. `getAccountsFromOwnerId` - Lister comptes d'un propriétaire
3. `getAccountById` - Détail d'un compte
4. `updateNameAccount` - Renommer un compte
5. `closeOwnAccount` - Supprimer un compte (si solde=0)
6. `getAccountBalance` - Solde détaillé (réel, disponible, découvert)
7. `getAccountTransactions` - Transactions paginées avec filtres
8. `getAccountStatement` - Relevé de compte sur période

### **Transactions (3)** ✅

1. `createTransaction` - Créer un transfert avec 2 transactions (DEBIT + CREDIT)
2. `getTransactionHistory` - Historique transactions utilisateur
3. `getAccountTransactionsByAdmin` - Transactions par compte (admin)

### **Transfers (2)** ✅

1. `validTransferByAdmin` - Valider un transfert PENDING → VALIDATED
2. `cancelTransfer` - Annuler un transfert

### **Credits (10)** ✅

1. `grantCredit` - Octroyer un crédit (conseiller)
2. `simulateAmortizationSchedule` - Simuler échéancier
3. `getCustomerCreditsWithDueDates` - Crédits client avec échéances
4. `getMyCredits` - Mes crédits (client)
5. `getCreditStatus` - Statut d'un crédit
6. `getPaymentHistory` - Historique paiements
7. `payInstallment` - Payer une échéance
8. `earlyRepayCredit` - Remboursement anticipé
9. `markOverdueDueDates` - Marquer échéances en retard (CRON)
10. `getOverdueDueDates` - Liste échéances impayées

### **Shares (13)** ✅

1. `createShare` - Créer une action (directeur)
2. `updateShare` - Modifier une action (directeur)
3. `deleteShare` - Supprimer une action (directeur)
4. `getAllShares` - Liste toutes les actions
5. `getShareById` - Détail d'une action
6. `placeOrder` - Passer un ordre d'achat/vente
7. `cancelOrder` - Annuler un ordre en attente
8. `getOrdersByCustomer` - Mes ordres
9. `getClientPositions` - Mon portefeuille (positions)
10. `calculateSharePrice` - Prix d'équilibre (algorithme matching)
11. `getOrderBook` - Carnet d'ordres (bids/asks)
12. `executeMatchingOrders` - Matcher et exécuter ordres compatibles
13. `getShareTransactionHistory` - Historique transactions d'une action

### **Conversations (9)** ✅

1. `createConversation` - Créer une conversation client-conseiller
2. `createGroupConversation` - Créer conversation de groupe
3. `sendMessage` - Envoyer un message (WebSocket temps réel)
4. `getConversationMessages` - Messages d'une conversation
5. `getCustomerConversations` - Conversations d'un client
6. `getAdvisorConversations` - Conversations d'un conseiller
7. `transferConversation` - Transférer à un autre conseiller
8. `closeConversation` - Fermer une conversation
9. `addParticipant` - Ajouter un participant

---

## 📌 Prochaines Étapes (Roadmap)

### **🟠 Priorité 1 - Module Épargne (Backend + Frontend)**

#### **Entités à créer**

- `SavingsRate` - Taux d'épargne
- `DailyInterest` - Intérêts journaliers

#### **Use Cases à créer**

1. `calculateDailyInterest` - Calculer intérêts journaliers (CRON)
2. `creditDailyInterest` - Créditer les intérêts (quotidien/mensuel)
3. `updateSavingsRate` - Modifier le taux (directeur)
4. `getSavingsRateHistory` - Historique des taux
5. `notifyCustomersOfRateChange` - Notifier changement taux
6. `getAccountInterestHistory` - Historique intérêts d'un compte

---

### **🟡 Priorité 3 - Fonctionnalités Directeur**

#### **Gestion Utilisateurs**

- `banUser` - Bannir un utilisateur
- `unbanUser` - Débannir
- `deleteUser` - Supprimer (RGPD)

#### **Gestion Actions**

- `activateShare` - Activer une action sur le marché
- `deactivateShare` - Désactiver (bloquer nouveaux ordres)

---

## 📚 Références

- **Clean Architecture** : Robert C. Martin (Uncle Bob)
- **Clean Code** : Robert C. Martin
- **Domain-Driven Design** : Eric Evans
- **Patterns of Enterprise Application Architecture** : Martin Fowler

---

## 👥 Contributeurs

Projet développé dans le cadre du cours de Clean Architecture à l'ESGI (5IW).

---

## 📄 Licence

Ce projet est un projet étudiant à des fins pédagogiques.
