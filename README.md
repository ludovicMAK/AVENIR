# 🏦 AVENIR - Banking Application

**Alliance de Valeurs Économiques et Nationnales Investies Responsablement**

---

## 📋 Introduction

La banque AVENIR vous a recruté comme développeur Web afin de développer une application moderne permettant à ses clients de gérer efficacement leurs liquidités, épargne et investissements, et ainsi concurrencer les banques traditionnelles.

---

## ⚙️ Contraintes Techniques

### 1. **Langage**

- Développement en **TypeScript** (backend et frontend)

### 2. **Clean Architecture**

- **Séparation stricte des couches** :
  - **Domain** : Entités métier
  - **Application** : Use Cases
  - **Interface** : API/Interface utilisateur
  - **Infrastructure** : Base de données, frameworks
- Chaque couche doit être **indépendante** des frameworks spécifiques
- **2 adaptateurs** pour les bases de données (in-memory, SQL, NoSQL, etc.)
- **2 frameworks backend** (Nest.js, Express, Fastify, etc.)

### 3. **Clean Code**

- Respect des principes de Clean Code
- Références : livres de Robert C. Martin (Uncle Bob)

---

## 🎯 Fonctionnalités

### 👤 Client

#### **Authentification**

- Inscription avec confirmation par email
- Création automatique du premier compte à l'inscription
- Connexion sécurisée

#### **Gestion des Comptes**

- Créer autant de comptes que souhaité
- Génération automatique d'IBAN unique et mathématiquement valide
- Renommer un compte (nom personnalisé)
- Supprimer un compte (si solde = 0 et aucune transaction en attente)
- Consulter le solde (somme des opérations de débit et crédit)

#### **Opérations Bancaires**

- **Créer un transfert** entre comptes (uniquement au sein de la banque AVENIR)
  - Vérification du solde disponible (incluant découvert autorisé)
  - Création immédiate des transactions en statut `POSTED`
  - Mise à jour du solde disponible
  - Le transfert reste en statut `PENDING` jusqu'à validation
- **Validation des transferts** par un administrateur (conseiller ou directeur)
  - Passage du transfert de `PENDING` à `VALIDATED`
  - Passage des transactions de `POSTED` à `VALIDATED`
  - Mise à jour du solde réel
- Consulter l'historique des transactions avec filtres et pagination
- Consulter le relevé de compte sur une période donnée
- Le solde reflète la somme de toutes les transactions (débit/crédit)

#### **Épargne**

- Ouvrir un compte d'épargne
- Effectuer des opérations entrantes et sortantes
- **Rémunération quotidienne** au taux en vigueur (fixé par le directeur)
- Calcul automatique des intérêts journaliers

#### **Investissement**

- Enregistrer des **ordres d'achat** ou de **vente** d'actions
- Consulter la liste des actions disponibles (définies par le directeur)
- Le cours est calculé selon le **prix d'équilibre** du carnet d'ordres
- **Pas de frais d'arbitrage** (banque moderne)
- Frais fixes : **1€ à l'achat** et **1€ à la vente**
- Propriété réelle des actions (pas de prêt de titres)

---

### 👑 Directeur de Banque

#### **Authentification**

- Connexion sécurisée avec rôle directeur

#### **Gestion des Utilisateurs**

- Créer, modifier ou supprimer un compte client
- Bannir ou débannir un utilisateur

#### **Gestion du Taux d'Épargne**

- Modifier le taux d'épargne applicable à tous les comptes épargne
- **Notification automatique** à tous les clients ayant un compte épargne lors d'un changement de taux

#### **Gestion des Actions**

- Créer, modifier et supprimer des actions disponibles
- Activer/désactiver une action sur le marché
- **Le cours n'est pas modifiable manuellement** (calculé automatiquement par le carnet d'ordres)
- Les clients sont **propriétaires réels** de leurs actions

---

### 💼 Conseiller Bancaire

#### **Authentification**

- Connexion sécurisée avec rôle conseiller

#### **Gestion des Crédits**

- Octroyer des crédits aux clients
- Paramètres du crédit :
  - **Taux annuel d'intérêts** (calculé sur le capital restant)
  - **Assurance obligatoire** (taux fixe sur le montant total du crédit)
  - **Mensualités constantes** (méthode de calcul standard)
  - Génération automatique du tableau d'amortissement
- Suivi des échéances et des paiements

#### **Messagerie Instantanée**

- Consulter tous les messages en attente de réponse (visibles par tous les conseillers)
- Répondre aux messages clients
- **Attribution automatique** : le premier conseiller qui répond devient le gestionnaire principal de la conversation
- **Transfert de conversation** : possibilité de transférer une discussion à un autre conseiller
- Historique complet des échanges et transferts

---

## 📊 Modèle de Données

### 👤 **User** (Utilisateur)

**Attributs :**

- `id` : Identifiant unique
- `lastName` : Nom de famille
- `firstName` : Prénom
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé
- `role` : Rôle (`customer` / `advisor` / `director`)
- `status` : Statut (`active` / `banned`)
- `dateInscription` : Date d'inscription

**Relations :**

- 1 user **a** 0..\* accounts
- 1 customer **peut avoir** 0..1 assigned advisor
- 1 customer **peut avoir** 0..\* credits
- 1 customer **place** 0..\* orders
- 1 customer **ouvre** 0..\* conversations
- 1 advisor **gère** 0..\* conversations

**Description :**  
Représente une personne dans le système (client, conseiller, directeur). Utilisé pour l'authentification, les droits et le lien avec les actions (comptes, ordres, messages, etc.).

---

### 💳 **Account** (Compte)

**Attributs :**

- `id` : Identifiant unique
- `accountType` : Type de compte (`current` / `savings`)
- `iban` : IBAN unique et valide
- `accountName` : Nom personnalisé du compte
- `authorizedOverdraft` : Découvert autorisé (boolean)
- `overdraftLimit` : Limite de découvert (en centimes)
- `overdraftFees` : Frais de découvert (en centimes)
- `status` : Statut (`open` / `closed`)
- `ownerId` : ID du propriétaire (User)

**Relations :**

- 1 account **appartient à** 1 user (customer)
- 1 account **a** 0..\* transactions
- 1 account **reçoit/émet** 0..\* transfers

**Règles métier :**

- Peut être fermé uniquement si solde = 0 et aucune transaction en attente
- L'IBAN doit être mathématiquement valide et unique
- Le compte dispose de **deux types de soldes** :
  - **Balance** (solde réel) : Transactions validées uniquement
  - **BalanceAvailable** (solde disponible) : Transactions postées (incluant les transferts en attente de validation)

**Description :**  
C'est le "portefeuille" bancaire d'un client (courant ou épargne). L'argent entre ou sort via des transactions. Le système maintient deux soldes distincts pour gérer les transferts en attente de validation administrative.

---

### 💸 **Transaction** (Mouvement comptable)

**Attributs :**

- `id` : Identifiant unique
- `accountIBAN` : IBAN du compte concerné
- `direction` : Direction (`debit` / `credit`)
- `amount` : Montant (en centimes)
- `reason` : Description/Motif de la transaction
- `accountDate` : Date comptable de la transaction
- `status` : Statut (`posted` / `validated` / `cancelled`)
- `transferId` : ID du transfert associé (obligatoire pour les virements)

**Relations :**

- 1 transaction **concerne** 1 account (identifié par IBAN)
- 1 transaction **est liée à** 1 transfer (pour les virements)

**Statuts des transactions :**

- `POSTED` : Transaction créée et comptabilisée (affecte le solde disponible)
- `VALIDATED` : Transaction validée par un administrateur (affecte le solde réel)
- `CANCELLED` : Transaction annulée

**Description :**  
C'est une **ligne comptable** sur un compte : entrée (crédit) ou sortie (débit). Tous les mouvements d'argent passent par des transactions. Pour les virements, chaque Transfer génère exactement 2 transactions (une DEBIT sur le compte source, une CREDIT sur le compte destination).

---

### 🔄 **Transfer** (Virement)

**Attributs :**

- `id` : Identifiant unique
- `amount` : Montant (en centimes)
- `dateRequested` : Date de demande du transfert
- `dateExecuted` : Date d'exécution prévue/effective
- `description` : Description du virement
- `status` : Statut (`pending` / `validated` / `cancelled`)

**Relations :**

- 1 transfer **génère** exactement 2 transactions (débit source, crédit cible)
- Les comptes source et destination sont identifiés via les transactions associées

**Règles métier :**

- À la création d'un transfert (`CreateTransaction`) :
  - Le Transfer est créé avec statut `PENDING`
  - 2 Transactions sont immédiatement créées avec statut `POSTED` (une DEBIT, une CREDIT)
  - Le solde disponible des comptes est mis à jour immédiatement
  - Validation des fonds disponibles avant création
- Lors de la validation par un administrateur (`ValidTransferByAdmin`) :
  - Le Transfer passe de `PENDING` à `VALIDATED`
  - Les Transactions passent de `POSTED` à `VALIDATED`
  - Le solde réel des comptes est mis à jour

**Description :**  
Une **opération** qui transfère de l'argent d'un compte à un autre au sein de la banque AVENIR. Le transfert est créé en statut `PENDING` et nécessite une validation administrative pour être finalisé. Les transactions sont créées immédiatement avec le transfert, permettant un suivi précis des mouvements.

**Flux de transfert :**

1. **Création** (`CreateTransaction`) :

   - Le client demande un transfert entre deux comptes AVENIR
   - Validation : solde disponible suffisant (incluant découvert)
   - Création d'un Transfer en statut `PENDING`
   - Création de 2 Transactions en statut `POSTED` :
     - Transaction DEBIT sur le compte source
     - Transaction CREDIT sur le compte destination
   - Mise à jour immédiate du **solde disponible** (balanceAvailable)
   - ⚠️ Le **solde réel** (balance) n'est pas encore modifié

2. **Validation** (`ValidTransferByAdmin`) :
   - Un conseiller ou directeur valide le transfert
   - Le Transfer passe de `PENDING` à `VALIDATED`
   - Les 2 Transactions passent de `POSTED` à `VALIDATED`
   - Mise à jour du **solde réel** (balance) des deux comptes
   - Le transfert est définitivement exécuté

---

### 💰 **SavingsRate** (Taux d'épargne)

**Attributs :**

- `id` : Identifiant unique
- `rate` : Taux (en pourcentage)
- `dateEffect` : Date de prise d'effet

**Relations :**

- 1 rate **s'applique** à 0..\* calculs d'intérêts (selon la date)

**Description :**  
Conserve **l'historique** des taux appliqués aux comptes d'épargne. Permet de savoir quel taux utiliser à une date donnée pour calculer les intérêts.

---

### 📈 **DailyInterest** (Intérêts journaliers)

**Attributs :**

- `id` : Identifiant unique
- `date` : Date du calcul
- `calculationBase` : Base de calcul (montant de référence en centimes)
- `appliedRate` : Taux appliqué (en pourcentage)
- `calculatedInterest` : Intérêts calculés (en centimes)
- `creditMode` : Mode de crédit (`daily` / `monthly`)
- `accountId` : ID du compte épargne concerné

**Relations :**

- 1 interest **concerne** 1 account (savings)
- 0..1 lien vers une transaction créée au moment du crédit

**Description :**  
Trace le **calcul d'intérêts** d'un compte épargne pour un jour donné, et peut créer la transaction qui crédite ces intérêts sur le compte.

---

### 📊 **Share** (Action)

**Attributs :**

- `id` : Identifiant unique
- `name` : Nom de l'action
- `symbol` : Symbole boursier
- `totalNumberOfShares` : Nombre total de parts
- `initialPrice` : Prix initial (en centimes)
- `currentPrice` : Prix actuel (en centimes, calculé)
- `isActive` : Active sur le marché (boolean)

**Relations :**

- 1 share **a** 0..\* orders
- 1 share **a** 0..\* shareTransactions
- 1 share **est dans** 0..\* positions client

**Description :**  
Définit un **titre financier** coté sur la bourse interne (nom, nombre d'actions, prix initial). Sert de support pour les ordres et transactions.

---

### 📝 **Order** (Ordre d'achat/vente)

**Attributs :**

- `id` : Identifiant unique
- `direction` : Direction (`buy` / `sell`)
- `quantity` : Quantité
- `priceLimit` : Prix limite (en centimes)
- `validity` : Validité (`day` / `until_cancelled`)
- `status` : Statut (`active` / `executed` / `cancelled`)
- `dateCaptured` : Date de saisie
- `customerId` : ID du client
- `shareId` : ID de l'action

**Relations :**

- 1 order **est placé par** 1 customer
- 1 order **concerne** 1 share
- 1 order **peut participer à** 0..\* shareTransactions

**Règles métier :**

- À l'achat : bloquer l'argent nécessaire (+ frais de 1€)
- À la vente : bloquer les titres
- Pas de vente à découvert (quantité négative interdite)

**Description :**  
L'**intention** d'acheter ou de vendre une action, avec une quantité et un prix limite. L'ordre reste actif jusqu'à exécution ou annulation.

---

### 💹 **ShareTransaction** (Transaction boursière)

**Attributs :**

- `id` : Identifiant unique
- `priceExecuted` : Prix d'exécution (en centimes)
- `quantity` : Quantité échangée
- `dateExecuted` : Date d'exécution
- `buyerFee` : Frais acheteur (1€)
- `sellerFee` : Frais vendeur (1€)
- `shareId` : ID de l'action
- `buyOrderId` : ID de l'ordre d'achat
- `sellOrderId` : ID de l'ordre de vente

**Relations :**

- 1 shareTransaction **concerne** 1 share
- 1 shareTransaction **associe** 1 ordre d'achat et 1 ordre de vente
- 1 shareTransaction **met à jour** 2 positions client (acheteur/vendeur)
- 1 shareTransaction **génère** des transactions (cash, frais)

**Règle métier :**

- Le **prix affiché** d'une action = **dernier prix exécuté**

**Description :**  
C'est l'**échange réel** entre un ordre d'achat et un ordre de vente à un prix donné. Met à jour les positions de chacun et déclenche les mouvements (cash + frais).

---

### 🎯 **SecuritiesPosition** (Position titres)

**Attributs :**

- `id` : Identifiant unique
- `totalQuantity` : Quantité totale détenue
- `customerId` : ID du client
- `shareId` : ID de l'action

**Relations :**

- 1 position **appartient à** 1 customer
- 1 position **concerne** 1 share

**Description :**  
Indique **combien d'actions** d'un titre un client possède. Augmente après des achats et diminue après des ventes (jamais négatif si vente à découvert interdite).

---

### 🏦 **Credit** (Crédit)

**Attributs :**

- `id` : Identifiant unique
- `amountBorrowed` : Montant emprunté (en centimes)
- `annualRate` : Taux annuel d'intérêts (en pourcentage)
- `insuranceRate` : Taux d'assurance (en pourcentage)
- `durationInMonths` : Durée (en mois)
- `startDate` : Date de début
- `status` : Statut (`in_progress` / `completed`)
- `customerId` : ID du client
- `advisorId` : ID du conseiller qui a octroyé le crédit

**Relations :**

- 1 credit **appartient à** 1 customer
- 1 credit **a** 1..\* due dates (échéances)

**Règles métier :**

- Mensualités constantes (méthode de calcul standard)
- Intérêts calculés sur le capital restant dû
- Assurance obligatoire calculée sur le montant total

**Description :**  
Représente un **prêt** accordé au client (montant, taux, durée, statut). Il déclenche un versement initial puis des remboursements mensuels.

---

### 📅 **DueDate** (Échéance)

**Attributs :**

- `id` : Identifiant unique
- `dueDate` : Date d'échéance
- `totalAmount` : Montant total (en centimes)
- `interestShare` : Part d'intérêts (en centimes)
- `insuranceShare` : Part d'assurance (en centimes)
- `repaymentPortion` : Part de remboursement capital (en centimes)
- `status` : Statut (`payable` / `paid` / `overdue`)
- `paymentDate` : Date de paiement (si payé)
- `creditId` : ID du crédit concerné

**Relations :**

- 1 dueDate **concerne** 1 credit
- 1 dueDate **génère** 0..1 transaction (débit du compte)

**Description :**  
C'est un **paiement mensuel** d'un crédit (montant et répartition intérêts/assurance/remboursement). Quand elle est payée, un virement client-vers-banque est effectué.

---

### 💬 **Conversation** (Discussion)

**Attributs :**

- `id` : Identifiant unique
- `status` : Statut (`open` / `transferred` / `closed`)
- `dateOpened` : Date d'ouverture
- `customerId` : ID du client

**Relations :**

- 1 conversation **est ouverte par** 1 customer
- 1 conversation **est gérée par** 0..\* advisors (via ParticipantConversation)
- 1 conversation **contient** 1..\* messages

**Description :**  
Thread de **messagerie** entre un client et un ou plusieurs conseillers. Contient tous les messages et reste actif jusqu'à la clôture du sujet.

---

### 👥 **ParticipantConversation** (Participant)

**Attributs :**

- `id` : Identifiant unique
- `dateAdded` : Date d'ajout
- `dateEnd` : Date de fin (si retiré, sinon vide)
- `isPrincipal` : Principal (boolean) - le premier répondant peut être marqué principal
- `conversationId` : ID de la conversation
- `advisorId` : ID du conseiller

**Relations :**

- 1 participant **concerne** 1 conversation
- 1 participant **désigne** 1 advisor

**Règles :**

- Lors d'un **transfert**, le nouveau conseiller est **ajouté** comme participant (l'ancien n'est pas supprimé)
- **Tous les participants** peuvent envoyer des messages

**Description :**  
Liste les **conseillers autorisés** à participer à une conversation (le premier répondant, puis ceux ajoutés lors d'un transfert).

---

### 📧 **Message** (Message)

**Attributs :**

- `id` : Identifiant unique
- `text` : Contenu du message
- `sendDate` : Date d'envoi
- `senderId` : ID de l'expéditeur (User)
- `conversationId` : ID de la conversation

**Relations :**

- 1 message **appartient à** 1 conversation
- 1 message **est envoyé par** 1 user
- Si sender = advisor, il **doit être participant** à la conversation

**Description :**  
Contenu d'un **échange** dans une conversation (qui parle, quoi, quand). Constitue l'historique visible côté client et conseiller.

---

### 🔀 **TransferConversation** (Transfert de conversation)

**Attributs :**

- `id` : Identifiant unique
- `fromAdvisorId` : ID du conseiller source
- `toAdvisorId` : ID du conseiller cible
- `reason` : Raison du transfert
- `transferDate` : Date du transfert
- `conversationId` : ID de la conversation

**Relations :**

- 1 transferConversation **concerne** 1 conversation

**Règle :**

- Lors du transfert, **ajouter** `toAdvisor` à **ParticipantConversation** (l'ancien reste, les deux peuvent intervenir)

**Description :**  
Trace le **passage** d'un **conseiller** à un autre. À chaque transfert, le nouveau conseiller est ajouté comme participant ; les deux peuvent écrire.

---

### 🔐 **EmailConfirmationToken** (Token de confirmation)

**Attributs :**

- `id` : Identifiant unique
- `token` : Token de confirmation (unique)
- `userId` : ID de l'utilisateur
- `expiresAt` : Date d'expiration
- `isUsed` : Utilisé (boolean)

**Relations :**

- 1 token **concerne** 1 user

**Description :**  
Utilisé pour confirmer l'inscription d'un utilisateur via email.

---

### 🔑 **Session** (Session utilisateur)

**Attributs :**

- `id` : Identifiant unique
- `token` : Token de session (unique)
- `userId` : ID de l'utilisateur
- `expiresAt` : Date d'expiration

**Relations :**

- 1 session **concerne** 1 user

**Description :**  
Gère l'authentification et les sessions actives des utilisateurs.

---

## 🚀 État d'Avancement du Projet

### ✅ **Entités Implémentées (10/14)**

- ✅ User
- ✅ Account
- ✅ Transaction
- ✅ Transfer
- ✅ Share
- ✅ Order
- ✅ ShareTransaction
- ✅ SecuritiesPosition
- ✅ Conversation
- ✅ ParticipantConversation
- ✅ Message
- ✅ TransferConversation
- ✅ EmailConfirmationToken
- ✅ Session

### ❌ **Entités Manquantes (1/16)**

- ❌ **SavingsRate** (Taux d'épargne)
- ❌ **DailyInterest** (Intérêts journaliers)

**Note** : Les entités Credit et DueDate sont **déjà implémentées** ✅

---

### 📦 **Use Cases Implémentés**

#### ✅ **Utilisateurs**

- ✅ `registerUser` - Inscription
- ✅ `loginUser` - Connexion
- ✅ `confirmRegistration` - Confirmation email
- ✅ `getAllUsers` - Liste des utilisateurs

#### ✅ **Comptes**

- ✅ `createAccount` - Créer un compte
- ✅ `getAccountById` - Récupérer un compte
- ✅ `getAccountsFromOwnerId` - Comptes d'un propriétaire
- ✅ `updateNameAccount` - Renommer un compte
- ✅ `closeOwnAccount` - Fermer un compte
- ✅ `getAccountBalance` - Récupérer le solde détaillé d'un compte
- ✅ `getAccountTransactions` - Liste paginée des transactions avec filtres
- ✅ `getAccountStatement` - Relevé de compte sur une période

#### ✅ **Actions/Investissement**

- ✅ `createShare` - Créer une action (directeur)
- ✅ `getAllShares` - Lister les actions disponibles
- ✅ `getShareById` - Récupérer une action par ID
- ✅ `placeOrder` - Placer un ordre d'achat/vente
- ✅ `cancelOrder` - Annuler un ordre en attente
- ✅ `getOrdersByCustomer` - Ordres d'un client
- ✅ `getClientPositions` - Positions (portefeuille) d'un client
- ✅ `executeMatchingOrders` - Matcher et exécuter les ordres buy/sell
- ✅ `calculateSharePrice` - Calculer le prix d'équilibre
- ✅ `getOrderBook` - Afficher le carnet d'ordres pour une action
- ✅ `getShareTransactionHistory` - Historique des transactions d'une action

#### ✅ **Conversations**

- ✅ `createConversation` - Créer une conversation
- ✅ `createGroupConversation` - Conversation de groupe
- ✅ `addParticipant` - Ajouter un participant
- ✅ `closeConversation` - Fermer une conversation
- ✅ `transferConversation` - Transférer une conversation
- ✅ `sendMessage` - Envoyer un message
- ✅ `✅ **Transactions & Transferts**

- ✅ `createTransaction` - Créer un transfert avec ses 2 transactions
  - Crée un Transfer en statut `PENDING`
  - Génère 2 Transactions en statut `POSTED` (DEBIT + CREDIT)
  - Met à jour le solde disponible des comptes
  - Valide les fonds disponibles (incluant découvert)
- ✅ `validTransferByAdmin` - Valider un transfert par un administrateur
  - Passage du Transfer de `PENDING` à `VALIDATED`
  - Passage des Transactions de `POSTED` à `VALIDATED`
  - Mise à jour du solde réel des comptes
  - Réservé aux conseillers et directeurs

#### ⚠️ **Transferts** (Minimal)

- ✅ `validTransferByAdmin` - Valider un transfert (admin)

---

### 🔴 **Use Cases Manquants (Critiques)**

#### ❌ **Crédits** (Complètement implémentés - voir TODO.md)

Les use cases pour les crédits sont **déjà implémentés** :

- ✅ `grantCredit` - Octroyer un crédit (conseiller)
- ✅ `getCreditStatus` - Statut d'un crédit
- ✅ `getCustomerCreditsWithDueDates` - Crédits avec échéances
- ✅ `getMyCredits` - Mes crédits (client)
- ✅ `getOverdueDueDates` - Échéances en retard
- ✅ `getPaymentHistory` - Historique des paiements
- ✅ `payInstallment` - Payer une échéance
- ✅ `simulateAmortizationSchedule` - Simuler un crédit
- ✅ `markOverdueDueDates` - Marquer échéances en retard
- ✅ `earlyRepayCredit` - Remboursement anticipé

#### ❌ **Transferts** (Extensions possibles)

- ❌ `getTransferHistory` - Historique des transferts avec filtres
- ❌ `getTransferById` - Récupérer un transfert par ID
- ❌ `cancelTransfer` - Annuler un transfert en `PENDING`

#### ❌ **Épargne** (Complètement absent)

- ❌ `calculateDailyInterest` - Calculer intérêts journaliers (CRON)
- ❌ `creditDailyInterest` - Créditer les intérêts
- ❌ `updateSavingsRate` - Modifier le taux (directeur)
- ❌ `getSavingsRateHistory` - Historique des taux
- ❌ `notifyCustomersOfRateChange` - Notifier changement de taux

#### ❌ **Directeur**

- ❌ `banUser` - Bannir un utilisateur
- ❌ `unbanUser` - Débannir un utilisateur
- ❌ `deleteUser` - Supprimer un utilisateur
- ❌ `updateShare` - Modifier une action
- ❌ `deleteShare` - Supprimer une action
- ❌ `activateShare` / `deactivateShare` - Activer/désactiver une action

---

## 📌 Priorités de Développement

### 🔴 **Priorité 1 - Fonctionnalités essentielles**

1. Système d'**épargne** (SavingsRate, DailyInterest, calcul d'intérêts)
2. Extensions **transferts** (historique, annulation)
3. Gestion **directeur** (ban/unban, CRUD actions)

### 🟠 **Priorité 2 - Fonctionnalités métier**

1. **Notifications** (changement de taux, ordres exécutés)
2. **Dashboard** utilisateurs avec statistiques
3. Rapports et **analytics** (performance portefeuille)

---

## 📁 Architecture du Projet

```
AVENIR/
├── domain/                    # Couche Domain (Entités)
│   ├── entities/             # ✅ 14 entités
│   ├── values/               # ✅ Value Objects
│   └── errors/               # ✅ Erreurs métier
│
├── application/              # Couche Application (Use Cases)
│   ├── usecases/
│   │   ├── users/           # ✅ 5 use cases (auth, gestion)
│   │   ├── accounts/        # ✅ 8 use cases (CRUD, solde, transactions)
│   │   ├── shares/          # ✅ 11 use cases (CRUD, ordres, matching, prix)
│   │   ├── conversations/   # ✅ 9 use cases (messagerie conseiller)
│   │   ├── credits/         # ✅ 10 use cases (octroi, paiement, simulation)
│   │   ├── transactions/    # ✅ 1 use case (createTransaction)
│   │   └── transfer/        # ✅ 1 use case (validTransferByAdmin)
│   ├── repositories/        # ✅ Interfaces repositories
│   ├── services/            # ✅ Services (Email, Hash, IBAN, etc.)
│   └── requests/            # ✅ DTOs de requêtes
│
└── infrastructure/          # Couche Infrastructure
    ├── adaptaters/          # Implémentation repositories
    ├── express/             # ✅ Backend Express
    └── next/                # ✅ Frontend Next.js
```

---

## 🛠️ Technologies

- **Backend** : Express.js (TypeScript)
- **Frontend** : Next.js (TypeScript)
- **Base de données** : À implémenter (2 adaptateurs requis)
- **Architecture** : Clean Architecture
- **Code Quality** : Clean Code principles

---

## 📝 Notes Importantes

- **IBAN** : Doit être mathématiquement valide et unique
- **Mensualités** : Méthode de calcul à mensualité constante
- **Intérêts** : Calculés quotidiennement sur comptes épargne
- **Actions** : Les clients sont propriétaires réels de leurs actions
- **Frais** : 1€ à l'achat et 1€ à la vente (pas de frais d'arbitrage)
- **Carnet d'ordres** : Le prix est calculé par matching automatique
