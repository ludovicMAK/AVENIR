# 📚 API Express - Référence Complète des Routes

**Base URL :** `http://localhost:8000/api`

---

## 🔐 **AUTHENTIFICATION & UTILISATEURS**

### **POST** `/users/register`

**Description :** Créer un nouveau compte utilisateur  
**Body :**

```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "USER_CREATED",
  "message": "Utilisateur créé. Vérifiez votre email pour confirmer.",
  "data": { "userId": "uuid" }
}
```

---

### **GET** `/users/confirm-registration?token=xxx`

**Description :** Confirmer l'inscription par email  
**Query Params :** `token` (string)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "REGISTRATION_CONFIRMED",
  "message": "Inscription confirmée avec succès"
}
```

---

### **POST** `/login`

**Description :** Se connecter et obtenir un token  
**Body :**

```json
{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "LOGIN_SUCCESS",
  "data": {
    "user": {
      "id": "uuid",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@email.com",
      "role": "customer"
    },
    "token": "jwt-token-here"
  }
}
```

---

### **GET** `/users/me`

**Description :** Obtenir les infos de l'utilisateur connecté (nécessite auth)  
**Headers :** `Authorization: Bearer <token>`  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "user": {
      "id": "uuid",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@email.com",
      "role": "customer"
    }
  }
}
```

---

### **GET** `/users`

**Description :** Lister tous les utilisateurs (admin uniquement)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "users": [
      { "id": "uuid", "firstname": "Jean", "lastname": "Dupont", ... }
    ]
  }
}
```

---

## 💰 **COMPTES BANCAIRES**

### **GET** `/users/:userId/accounts`

**Description :** Récupérer tous les comptes d'un utilisateur  
**Params :** `userId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "accountName": "Compte Courant",
        "accountType": "current",
        "balance": 1500.5,
        "IBAN": "FR7630001007941234567890185",
        "authorizedOverdraft": true,
        "overdraftLimit": 500,
        "overdraftFees": 5,
        "status": "open"
      }
    ]
  }
}
```

---

### **GET** `/accounts/:accountId`

**Description :** Récupérer les détails d'un compte  
**Params :** `accountId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "account": {
      "id": "uuid",
      "accountName": "Compte Courant",
      "accountType": "current",
      "balance": 1500.50,
      "IBAN": "FR7630001007941234567890185",
      ...
    }
  }
}
```

---

### **POST** `/accounts`

**Description :** Créer un nouveau compte  
**Body :**

```json
{
  "idOwner": "uuid",
  "accountType": "current",
  "accountName": "Mon Compte Principal",
  "authorizedOverdraft": true,
  "overdraftLimit": 1000,
  "overdraftFees": 5
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "ACCOUNT_CREATED",
  "data": {
    "id": "uuid",
    "accountName": "Mon Compte Principal",
    "IBAN": "FR7630001007941234567890185",
    ...
  }
}
```

---

### **PATCH** `/accounts/:accountId/name`

**Description :** Renommer un compte  
**Params :** `accountId` (uuid)  
**Body :**

```json
{
  "accountName": "Nouveau Nom"
}
```

**Réponse :** `200 OK`

---

### **DELETE** `/accounts/:accountId`

**Description :** Fermer un compte (soft delete)  
**Params :** `accountId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "ACCOUNT_CLOSED",
  "message": "Compte fermé avec succès"
}
```

---

### **GET** `/accounts/:accountId/balance`

**Description :** Obtenir le solde d'un compte  
**Params :** `accountId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "balance": 1500.5,
    "available": 2000.5
  }
}
```

---

### **GET** `/accounts/:accountId/transactions`

**Description :** Récupérer les transactions d'un compte (paginées)  
**Params :** `accountId` (uuid)  
**Query Params (optionnels) :**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `startDate` (ISO date)
- `endDate` (ISO date)

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 150.0,
        "direction": "credit",
        "status": "validated",
        "label": "Salaire",
        "date": "2026-01-05T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

### **GET** `/accounts/:accountId/statement`

**Description :** Générer un relevé bancaire  
**Params :** `accountId` (uuid)  
**Query Params :**

- `startDate` (ISO date, requis)
- `endDate` (ISO date, requis)

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "statement": {
      "accountName": "Compte Courant",
      "IBAN": "FR76...",
      "startDate": "2026-01-01",
      "endDate": "2026-01-31",
      "openingBalance": 1200.00,
      "closingBalance": 1500.50,
      "transactions": [...]
    }
  }
}
```

---

## 💸 **TRANSACTIONS**

### **POST** `/transaction`

**Description :** Créer une transaction  
**Body :**

```json
{
  "accountId": "uuid",
  "amount": 100.0,
  "direction": "credit",
  "label": "Virement reçu"
}
```

**Réponse :** `201 Created`

---

## 🔄 **TRANSFERTS**

### **PATCH** `/transfers/validate`

**Description :** Valider un transfert (admin uniquement)  
**Body :**

```json
{
  "transferId": "uuid"
}
```

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "TRANSFER_VALIDATED",
  "message": "Transfert validé avec succès"
}
```

---

## 📈 **INVESTISSEMENTS (ACTIONS)**

### **POST** `/shares`

**Description :** Créer une nouvelle action sur le marché (admin)  
**Body :**

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology"
}
```

**Réponse :** `201 Created`

---

### **GET** `/shares`

**Description :** Lister toutes les actions disponibles  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "shares": [
      {
        "id": "uuid",
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "sector": "Technology",
        "currentPrice": 175.5
      }
    ]
  }
}
```

---

### **GET** `/shares/:id`

**Description :** Détails d'une action  
**Params :** `id` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "share": {
      "id": "uuid",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "currentPrice": 175.5
    }
  }
}
```

---

### **POST** `/orders`

**Description :** Passer un ordre d'achat/vente  
**Body :**

```json
{
  "customerId": "uuid",
  "shareId": "uuid",
  "quantity": 10,
  "direction": "buy",
  "orderType": "limit",
  "limitPrice": 175.0
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "ORDER_PLACED",
  "data": {
    "orderId": "uuid",
    "status": "pending"
  }
}
```

---

### **DELETE** `/orders/:orderId`

**Description :** Annuler un ordre (si status = pending)  
**Params :** `orderId` (uuid)  
**Réponse :** `200 OK`

---

### **GET** `/customers/:customerId/positions`

**Description :** Récupérer le portefeuille d'actions d'un client  
**Params :** `customerId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "positions": [
      {
        "shareId": "uuid",
        "symbol": "AAPL",
        "quantity": 50,
        "averagePrice": 170.0,
        "currentValue": 8775.0
      }
    ]
  }
}
```

---

### **GET** `/customers/:customerId/orders`

**Description :** Récupérer tous les ordres d'un client  
**Params :** `customerId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "shareId": "uuid",
        "symbol": "AAPL",
        "quantity": 10,
        "direction": "buy",
        "status": "executed",
        "executedPrice": 175.5,
        "createdAt": "2026-01-05T10:00:00Z"
      }
    ]
  }
}
```

---

### **GET** `/shares/:id/order-book`

**Description :** Obtenir le carnet d'ordres d'une action  
**Params :** `id` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "bids": [{ "price": 174.5, "quantity": 100 }],
    "asks": [{ "price": 175.5, "quantity": 80 }]
  }
}
```

---

### **GET** `/shares/:id/price`

**Description :** Calculer le prix actuel d'une action  
**Params :** `id` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "price": 175.5
  }
}
```

---

### **POST** `/shares/:id/execute-matching`

**Description :** Exécuter le matching des ordres (système automatique)  
**Params :** `id` (uuid)  
**Réponse :** `200 OK`

---

### **GET** `/shares/:id/transactions`

**Description :** Historique des transactions d'une action  
**Params :** `id` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "price": 175.5,
        "quantity": 10,
        "buyerId": "uuid",
        "sellerId": "uuid",
        "executedAt": "2026-01-05T14:30:00Z"
      }
    ]
  }
}
```

---

## 💳 **CRÉDITS**

### **POST** `/credits/grant`

**Description :** Accorder un crédit à un client  
**Body :**

```json
{
  "customerId": "uuid",
  "amount": 10000.0,
  "interestRate": 3.5,
  "durationMonths": 12,
  "accountId": "uuid"
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "CREDIT_GRANTED",
  "data": {
    "creditId": "uuid",
    "amortizationSchedule": [...]
  }
}
```

---

### **GET** `/credits/:customerId/credits-with-due-dates`

**Description :** Récupérer tous les crédits d'un client avec échéances  
**Params :** `customerId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "credits": [
      {
        "id": "uuid",
        "amount": 10000.0,
        "remainingAmount": 8500.0,
        "status": "active",
        "dueDates": [
          {
            "id": "uuid",
            "amount": 850.0,
            "dueDate": "2026-02-01",
            "status": "pending"
          }
        ]
      }
    ]
  }
}
```

---

### **GET** `/my-credits`

**Description :** Récupérer mes crédits (utilisateur connecté)  
**Headers :** `Authorization: Bearer <token>`  
**Réponse :** `200 OK` (même format que ci-dessus)

---

### **GET** `/credits/:creditId/status`

**Description :** Obtenir le statut d'un crédit  
**Params :** `creditId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "creditStatus": {
      "status": "active",
      "remainingAmount": 8500.0,
      "paidAmount": 1500.0,
      "nextDueDate": "2026-02-01",
      "overdueCount": 0
    }
  }
}
```

---

### **GET** `/credits/:creditId/payment-history`

**Description :** Historique des paiements d'un crédit  
**Params :** `creditId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "paymentHistory": [
      {
        "dueDate": "2026-01-01",
        "amount": 850.0,
        "paidAt": "2026-01-01T09:00:00Z",
        "status": "paid"
      }
    ]
  }
}
```

---

### **POST** `/credits/simulate-schedule`

**Description :** Simuler un tableau d'amortissement  
**Body :**

```json
{
  "amount": 10000.0,
  "interestRate": 3.5,
  "durationMonths": 12
}
```

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "schedule": [
      {
        "month": 1,
        "payment": 850.0,
        "principal": 820.83,
        "interest": 29.17,
        "remainingBalance": 9179.17
      }
    ]
  }
}
```

---

### **POST** `/due-dates/:dueDateId/pay`

**Description :** Payer une échéance  
**Params :** `dueDateId` (uuid)  
**Body :**

```json
{
  "accountId": "uuid"
}
```

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "INSTALLMENT_PAID",
  "message": "Échéance payée avec succès"
}
```

---

### **POST** `/credits/:creditId/early-repayment`

**Description :** Remboursement anticipé d'un crédit  
**Params :** `creditId` (uuid)  
**Body :**

```json
{
  "accountId": "uuid"
}
```

**Réponse :** `200 OK`

```json
{
  "status": 200,
  "code": "CREDIT_REPAID",
  "data": {
    "remainingAmount": 0,
    "fees": 100.0
  }
}
```

---

### **POST** `/credits/mark-overdue`

**Description :** Marquer les échéances en retard (système automatique)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "markedCount": 5
  }
}
```

---

### **GET** `/credits/overdue`

**Description :** Récupérer toutes les échéances en retard  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "overdueDueDates": [
      {
        "dueDateId": "uuid",
        "creditId": "uuid",
        "amount": 850.0,
        "dueDate": "2025-12-01",
        "daysOverdue": 37
      }
    ]
  }
}
```

---

## 💬 **CONVERSATIONS (MESSAGERIE)**

### **POST** `/conversations`

**Description :** Créer une conversation (client → conseiller)  
**Body :**

```json
{
  "customerId": "uuid",
  "advisorId": "uuid",
  "type": "support",
  "subject": "Question sur mon compte"
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "CONVERSATION_CREATED",
  "data": {
    "conversationId": "uuid"
  }
}
```

---

### **POST** `/conversations/group`

**Description :** Créer une conversation de groupe  
**Body :**

```json
{
  "participantIds": ["uuid1", "uuid2", "uuid3"],
  "subject": "Réunion projet"
}
```

**Réponse :** `201 Created`

---

### **POST** `/conversations/messages`

**Description :** Envoyer un message dans une conversation  
**Body :**

```json
{
  "conversationId": "uuid",
  "senderId": "uuid",
  "content": "Bonjour, j'ai une question..."
}
```

**Réponse :** `201 Created`

```json
{
  "status": 201,
  "code": "MESSAGE_SENT",
  "data": {
    "messageId": "uuid",
    "sentAt": "2026-01-07T15:30:00Z"
  }
}
```

---

### **POST** `/conversations/transfer`

**Description :** Transférer une conversation à un autre conseiller  
**Body :**

```json
{
  "conversationId": "uuid",
  "newAdvisorId": "uuid"
}
```

**Réponse :** `200 OK`

---

### **PATCH** `/conversations/:conversationId/close`

**Description :** Clôturer une conversation  
**Params :** `conversationId` (uuid)  
**Réponse :** `200 OK`

---

### **GET** `/conversations/:conversationId/messages`

**Description :** Récupérer tous les messages d'une conversation  
**Params :** `conversationId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Bonjour...",
        "sentAt": "2026-01-07T15:30:00Z",
        "readAt": null
      }
    ]
  }
}
```

---

### **GET** `/customers/:customerId/conversations`

**Description :** Récupérer toutes les conversations d'un client  
**Params :** `customerId` (uuid)  
**Réponse :** `200 OK`

```json
{
  "status": 200,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "subject": "Question sur mon compte",
        "status": "open",
        "unreadCount": 2,
        "lastMessageAt": "2026-01-07T15:30:00Z"
      }
    ]
  }
}
```

---

### **GET** `/advisors/:advisorId/conversations`

**Description :** Récupérer toutes les conversations d'un conseiller  
**Params :** `advisorId` (uuid)  
**Réponse :** `200 OK` (même format)

---

### **POST** `/conversations/:conversationId/participants`

**Description :** Ajouter un participant à une conversation  
**Params :** `conversationId` (uuid)  
**Body :**

```json
{
  "participantId": "uuid"
}
```

**Réponse :** `200 OK`

---

# 🎯 GUIDE D'IMPLÉMENTATION PAR PHASE

---

## 📦 **PHASE 1 : COMPTES** (Routes déjà disponibles)

### **Routes Express utilisées :**

- ✅ `GET /users/:userId/accounts` → Liste des comptes
- ✅ `GET /accounts/:accountId` → Détail compte
- ✅ `POST /accounts` → Créer compte
- ✅ `PATCH /accounts/:accountId/name` → Renommer
- ✅ `DELETE /accounts/:accountId` → Fermer
- ✅ `GET /accounts/:accountId/balance` → Solde
- ✅ `GET /accounts/:accountId/transactions` → Transactions
- ✅ `GET /accounts/:accountId/statement` → Relevé

### **Étape 1.1** - API Client Comptes (`/infrastructure/next/api/account.ts`)

**Action :** Les 8 méthodes sont déjà créées ✅

- `getByOwnerId()`
- `getById()`
- `create()`
- `updateName()`
- `close()`
- `getBalance()`
- `getTransactions()`
- `getStatement()`

**Créer :**

- `hooks/useAccounts.ts` → Hooks React pour gérer le state
- `lib/accounts/utils.ts` → Fonctions formatage (IBAN, montants)

---

### **Étape 1.2** - Dashboard (`/app/dashboard/page.tsx`)

**Routes utilisées :**

- `GET /users/:userId/accounts` → Récupérer tous les comptes
- `GET /accounts/:accountId/balance` → Solde de chaque compte

**Créer :**

- Page serveur qui fetch les comptes
- Client component avec stats cards
- Liste des derniers comptes

---

### **Étape 1.3** - Liste Comptes (`/app/dashboard/accounts/page.tsx`)

**Routes utilisées :**

- `GET /users/:userId/accounts` → Liste complète

**Créer :**

- Grille de cards avec tous les comptes
- Filtres par type (current/savings/trading)
- Bouton "Créer un compte"

---

### **Étape 1.4** - Créer Compte (`/app/dashboard/accounts/new/page.tsx`)

**Routes utilisées :**

- `POST /accounts` → Créer le compte

**✅ DÉJÀ FAIT !** (Avec validation Zod)

---

### **Étape 1.5** - Détail Compte (`/app/dashboard/accounts/[id]/page.tsx`)

**Routes utilisées :**

- `GET /accounts/:accountId` → Infos compte
- `GET /accounts/:accountId/transactions` → Transactions paginées

**Créer :**

- Page détail avec IBAN, solde, découvert
- Tableau transactions avec pagination
- Boutons actions (Renommer, Fermer, Relevé)

---

### **Étape 1.6** - Modal Renommer

**Routes utilisées :**

- `PATCH /accounts/:accountId/name` → Mise à jour

**Créer :**

- Modal avec formulaire simple
- Input nom + validation
- Refresh après succès

---

### **Étape 1.7** - Relevé (`/app/dashboard/accounts/[id]/statement/page.tsx`)

**Routes utilisées :**

- `GET /accounts/:accountId/statement?startDate=xxx&endDate=xxx`

**Créer :**

- Date picker (période)
- Affichage relevé (PDF ou HTML)
- Bouton télécharger

---

## 🔄 **PHASE 2 : TRANSFERTS**

### **Routes Express utilisées :**

- ✅ `PATCH /transfers/validate` → Valider transfert (admin)

### ⚠️ **ROUTES MANQUANTES À CRÉER :**

- ❌ `POST /transfers` → Créer un transfert
- ❌ `GET /users/:userId/transfers` → Liste transferts d'un user

### **Étape 2.1** - API Client Transferts

**Action :**

1. Créer `/infrastructure/express/src/routes/transferRoutes.ts`
   - Ajouter `POST /transfers`
   - Ajouter `GET /users/:userId/transfers`
2. Créer `/infrastructure/next/api/transfers.ts`
   - Méthode `create()`
   - Méthode `getByUserId()`
3. Créer `hooks/useTransfers.ts`

---

### **Étape 2.2** - Nouveau Transfert (`/app/dashboard/transfers/new/page.tsx`)

**Routes utilisées :**

- `POST /transfers` (à créer)
- `GET /users/:userId/accounts` → Liste comptes source

**Créer :**

- Formulaire avec validation IBAN
- Sélection compte source
- Confirmation montant

---

### **Étape 2.3** - Historique Transferts (`/app/dashboard/transfers/page.tsx`)

**Routes utilisées :**

- `GET /users/:userId/transfers` (à créer)

**Créer :**

- Liste avec badges status (pending/validated)
- Filtres date/montant

---

## 📈 **PHASE 3 : INVESTISSEMENTS**

### **Routes Express utilisées :**

- ✅ `GET /shares` → Toutes les actions
- ✅ `GET /shares/:id` → Détail action
- ✅ `POST /orders` → Passer ordre
- ✅ `DELETE /orders/:orderId` → Annuler ordre
- ✅ `GET /customers/:customerId/positions` → Portefeuille
- ✅ `GET /customers/:customerId/orders` → Mes ordres
- ✅ `GET /shares/:id/order-book` → Carnet d'ordres
- ✅ `GET /shares/:id/price` → Prix actuel
- ✅ `GET /shares/:id/transactions` → Historique

### **Étape 3.1** - API Client Investissements

**Action :**

1. Créer `/infrastructure/next/api/shares.ts`
   - `getAll()`, `getById()`, `getOrderBook()`, `getPrice()`
2. Créer `/infrastructure/next/api/orders.ts`
   - `create()`, `cancel()`, `getByCustomerId()`
3. Créer `hooks/useShares.ts`, `hooks/useOrders.ts`

---

### **Étape 3.2** - Marché (`/app/dashboard/investments/market/page.tsx`)

**Routes utilisées :**

- `GET /shares` → Grille d'actions

**Créer :**

- Grille avec prix, variation
- Recherche/filtres secteur

---

### **Étape 3.3** - Détail Action (`/app/dashboard/investments/market/[shareId]/page.tsx`)

**Routes utilisées :**

- `GET /shares/:id` → Infos action
- `GET /shares/:id/order-book` → Carnet d'ordres

**Créer :**

- Infos action (symbol, nom, secteur)
- Tableau bids/asks
- Bouton "Passer un ordre"

---

### **Étape 3.4** - Modal Passer Ordre

**Routes utilisées :**

- `POST /orders` → Créer ordre

**Créer :**

- Formulaire buy/sell
- Validation quantité/prix
- Confirmation

---

### **Étape 3.5** - Mes Ordres (`/app/dashboard/investments/orders/page.tsx`)

**Routes utilisées :**

- `GET /customers/:customerId/orders`
- `DELETE /orders/:orderId` → Annuler

**Créer :**

- Liste ordres avec badges
- Bouton annuler (si pending)

---

### **Étape 3.6** - Portefeuille (`/app/dashboard/investments/portfolio/page.tsx`)

**Routes utilisées :**

- `GET /customers/:customerId/positions`

**Créer :**

- Liste positions
- Calcul valeur totale

---

## 💳 **PHASE 4 : CRÉDITS**

### **Routes Express utilisées :**

- ✅ `GET /my-credits` → Mes crédits
- ✅ `GET /credits/:creditId/status` → Statut crédit
- ✅ `GET /credits/:creditId/payment-history` → Historique
- ✅ `POST /credits/simulate-schedule` → Simuler
- ✅ `POST /due-dates/:dueDateId/pay` → Payer échéance
- ✅ `POST /credits/:creditId/early-repayment` → Remboursement anticipé

### **Étape 4.1** - API Client Crédits

**Action :**

1. Créer `/infrastructure/next/api/credits.ts`
   - `getMyCredits()`, `getStatus()`, `getPaymentHistory()`
   - `payInstallment()`, `simulateSchedule()`, `earlyRepayment()`
2. Créer `hooks/useCredits.ts`

---

### **Étape 4.2** - Mes Crédits (`/app/dashboard/credits/page.tsx`)

**Routes utilisées :**

- `GET /my-credits`

**Créer :**

- Liste crédits en cours
- Prochaine échéance

---

### **Étape 4.3** - Détail Crédit (`/app/dashboard/credits/[id]/page.tsx`)

**Routes utilisées :**

- `GET /credits/:creditId/status`
- `GET /credits/:creditId/payment-history`

**Créer :**

- Tableau amortissement
- Badges échéances
- Bouton payer

---

### **Étape 4.4** - Modal Payer Échéance

**Routes utilisées :**

- `POST /due-dates/:dueDateId/pay`

**Créer :**

- Sélection compte
- Confirmation

---

### **Étape 4.5** - Simulateur (`/app/dashboard/credits/simulator/page.tsx`)

**Routes utilisées :**

- `POST /credits/simulate-schedule`

**Créer :**

- Formulaire (montant, durée, taux)
- Tableau amortissement preview

---

## 💬 **PHASE 5 : MESSAGERIE**

### **Routes Express utilisées :**

- ✅ `POST /conversations` → Créer conversation
- ✅ `POST /conversations/messages` → Envoyer message
- ✅ `GET /conversations/:conversationId/messages` → Messages
- ✅ `GET /customers/:customerId/conversations` → Mes conversations
- ✅ `PATCH /conversations/:conversationId/close` → Fermer

### **Étape 5.1** - API Client Conversations

**Action :**

1. Créer `/infrastructure/next/api/conversations.ts`
   - `create()`, `sendMessage()`, `getMessages()`, `getMyConversations()`
2. Créer `hooks/useConversations.ts`

---

### **Étape 5.2** - Conversations (`/app/dashboard/messages/page.tsx`)

**Routes utilisées :**

- `GET /customers/:customerId/conversations`

**Créer :**

- Liste conversations
- Badge non lus

---

### **Étape 5.3** - Chat (`/app/dashboard/messages/[id]/page.tsx`)

**Routes utilisées :**

- `GET /conversations/:conversationId/messages`
- `POST /conversations/messages`

**Créer :**

- Interface chat
- Input + envoi

---

### **Étape 5.4** - Nouvelle Conversation (`/app/dashboard/messages/new/page.tsx`)

**Routes utilisées :**

- `POST /conversations`

**Créer :**

- Formulaire sujet + message

---

# 📊 RÉSUMÉ ROUTES PAR MODULE

| Module              | Routes OK | Routes à créer | Total  |
| ------------------- | --------- | -------------- | ------ |
| **Auth/Users**      | 5         | 0              | 5      |
| **Comptes**         | 8         | 0              | 8      |
| **Transactions**    | 1         | 0              | 1      |
| **Transferts**      | 1         | 2              | 3      |
| **Investissements** | 11        | 0              | 11     |
| **Crédits**         | 10        | 0              | 10     |
| **Messagerie**      | 9         | 0              | 9      |
| **TOTAL**           | **45**    | **2**          | **47** |

---

# ✅ CHECKLIST AVANT CHAQUE PHASE

Avant de commencer une phase, vérifier :

1. **Backend Express** :

   - [ ] Routes nécessaires existent
   - [ ] Si manquantes → créer dans `/infrastructure/express/src/routes/`
   - [ ] Tester avec Postman

2. **Frontend Next.js** :

   - [ ] Créer `/infrastructure/next/api/[module].ts`
   - [ ] Créer `hooks/use[Module].ts`
   - [ ] Créer utils si besoin

3. **Pages** :
   - [ ] Créer page serveur (auth check)
   - [ ] Créer client component
   - [ ] Tester en local

---

**Prochaine étape recommandée : Phase 1, Étape 1.2 (Dashboard)** 🚀
