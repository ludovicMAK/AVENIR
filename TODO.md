# 📝 TODO - Fonctionnalités Restantes AVENIR

**Dernière mise à jour** : 7 janvier 2026  
**Branche** : `main`

---

## ✅ RÉCEMMENT COMPLÉTÉ

### 🎯 **Investissements** (Phase 1 - Complétée)

- ✅ `executeMatchingOrders` - Matcher et exécuter les ordres buy/sell
- ✅ `calculateSharePrice` - Calculer le prix d'équilibre
- ✅ `getOrderBook` - Afficher le carnet d'ordres pour une action
- ✅ `getShareTransactionHistory` - Historique des transactions d'une action
- ✅ Blocage des fonds/titres dans `PlaceOrder` (intégré)
- ✅ Méthodes `blockFunds()` et `unblockFunds()` dans repositories
- ✅ Routes HTTP et handlers pour les nouveaux endpoints
- ✅ Corrections PostgreSQL et InMemory repositories

**Routes ajoutées :**

- `GET /shares/:shareId/transactions` - Historique
- `GET /shares/:shareId/order-book` - Carnet d'ordres
- `GET /shares/:shareId/price` - Prix d'équilibre
- `POST /shares/:shareId/execute` - Exécuter les matchings

### 💰 **Solde des Comptes** (Complété - 7 janvier 2026)

- ✅ `getAccountBalance` - Calculer le solde détaillé d'un compte
- ✅ `getAccountTransactions` - Liste paginée des transactions avec filtres
- ✅ `getAccountStatement` - Relevé de compte sur une période
- ✅ Extension `TransactionRepository` avec `findByAccountIBAN`
- ✅ Implémentation PostgreSQL et InMemory avec filtres et pagination
- ✅ Routes HTTP et handlers pour les nouveaux endpoints

**Routes ajoutées :**

- `GET /accounts/:accountId/balance` - Solde détaillé
- `GET /accounts/:accountId/transactions` - Transactions paginées
- `GET /accounts/:accountId/statement` - Relevé de compte

---

## 🔴 PRIORITÉ 1 - FONCTIONNALITÉS CRITIQUES

### 🏦 **Système de Transferts**

**Statut Backend** : ✅ Complet (5/5 use cases)
**Statut Frontend** : ❌ Absent (0/2 pages)

#### ✅ Use Cases Implémentés (Backend)

1. **`CreateTransaction`** - Créer un transfert entre comptes ✅

   - Crée Transfer + 2 transactions (POSTED)
   - Validation fonds disponibles
   - UnitOfWork pour atomicité
   - Route : `POST /transaction`

2. **`ValidTransferByAdmin`** - Valider un transfert ✅

   - Change status PENDING → VALIDATED
   - Met à jour solde réel des comptes
   - Route : `PATCH /transfers/validate`

3. **`CancelTransfer`** - Annuler un transfert ✅

   - Annule transfert et transactions associées
   - Route : `PATCH /transfers/cancel`

4. **`GetTransactionHistory`** - Historique des transactions ✅

   - Liste toutes les transactions utilisateur
   - Route : `GET /transactions/history`

5. **`GetAccountTransactionsByAdmin`** - Transactions d'un compte ✅
   - Pour admins (conseiller/directeur)
   - Route : `GET /transactions/account/:iban`

#### ❌ Frontend Manquant

- **Page `/dashboard/transfers`** - Liste des transferts

  - Afficher historique (PENDING, EXECUTED, CANCELLED)
  - Filtres par date, statut, montant
  - Pagination

- **Page `/dashboard/transfers/new`** - Créer un transfert
  - Sélection compte source/destination
  - Montant et description
  - Validation avant envoi

---

### 💰 **Crédits**

**Statut Backend** : ✅ Complet (10/10 use cases)
**Statut Frontend** : ❌ Absent (0/2 pages)

#### ✅ Entités Existantes

1. **`Credit`** ✅ - Crédits clients
2. **`DueDate`** ✅ - Échéances de remboursement

#### ✅ Value Objects Existants

- `CreditStatus` ✅ (IN_PROGRESS, COMPLETED)
- `DueDateStatus` ✅ (PAYABLE, PAID, OVERDUE)

#### ✅ Repositories Implémentés

- `CreditRepository` ✅
- `DueDateRepository` ✅

#### ✅ Use Cases Implémentés (Backend)

1. **`grantCredit`** ✅ - Octroyer un crédit

   - Route : `POST /credits/grant`

2. **`simulateAmortizationSchedule`** ✅ - Simuler échéancier

   - Route : `POST /credits/simulate-schedule`

3. **`getCustomerCreditsWithDueDates`** ✅ - Crédits + échéances client

   - Route : `GET /credits/:customerId/credits-with-due-dates`

4. **`getMyCredits`** ✅ - Mes crédits

   - Route : `GET /my-credits`

5. **`getCreditStatus`** ✅ - Statut d'un crédit

   - Route : `GET /credits/:creditId/status`

6. **`getPaymentHistory`** ✅ - Historique paiements

   - Route : `GET /credits/:creditId/payment-history`

7. **`payInstallment`** ✅ - Payer une échéance

   - Route : `POST /due-dates/:dueDateId/pay`

8. **`earlyRepayCredit`** ✅ - Remboursement anticipé

   - Route : `POST /credits/:creditId/early-repayment`

9. **`markOverdueDueDates`** ✅ - Marquer impayés

   - Route : `POST /credits/mark-overdue`

10. **`getOverdueDueDates`** ✅ - Liste impayés
    - Route : `GET /credits/overdue`

#### ❌ Frontend Manquant

- **Page `/dashboard/credits`** - Mes crédits

  - Liste avec échéancier
  - Statut et progression
  - Bouton payer échéance

- **Page `/dashboard/credits/[id]`** - Détail crédit
  - Tableau d'amortissement complet
  - Historique paiements
  - Remboursement anticipé

#### 🗄️ Schéma Base de Données

**Table `credits`**

```sql
CREATE TABLE credits (
  id VARCHAR(255) PRIMARY KEY,
  amount_borrowed INTEGER NOT NULL,
  annual_rate DECIMAL(5,2) NOT NULL,
  insurance_rate DECIMAL(5,2) NOT NULL,
  duration_in_months INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  advisor_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (advisor_id) REFERENCES users(id)
);
```

**Table `due_dates`**

```sql
CREATE TABLE due_dates (
  id VARCHAR(255) PRIMARY KEY,
  due_date DATE NOT NULL,
  total_amount INTEGER NOT NULL,
  interest_share INTEGER NOT NULL,
  insurance_share INTEGER NOT NULL,
  repayment_portion INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP,
  credit_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (credit_id) REFERENCES credits(id)
);
```

---

## 🟠 PRIORITÉ 2 - FONCTIONNALITÉS MÉTIER

### 🏦 **Épargne (Complètement Absent)**

**Statut** : ❌ 0% - Entités manquantes

#### ❌ Entités à Créer

1. **`SavingsRate`** (domain/entities/savingsRate.ts)

   ```typescript
   class SavingsRate {
     id: string;
     rate: number; // en pourcentage
     dateEffect: Date;
   }
   ```

2. **`DailyInterest`** (domain/entities/dailyInterest.ts)
   ```typescript
   class DailyInterest {
     id: string;
     date: Date;
     calculationBase: number;
     appliedRate: number;
     calculatedInterest: number;
     creditMode: CreditMode; // DAILY, MONTHLY
     accountId: string;
   }
   ```

#### ❌ Value Objects à Créer

- `CreditMode` (DAILY, MONTHLY)

#### ❌ Repositories à Créer

1. **`SavingsRateRepository`**

   - `save(rate: SavingsRate)`
   - `findById(id: string)`
   - `findAll()`
   - `findActiveRate(date: Date)` - Taux en vigueur à une date
   - `findHistory()` - Historique des taux

2. **`DailyInterestRepository`**
   - `save(interest: DailyInterest)`
   - `findById(id: string)`
   - `findByAccountId(accountId: string)`
   - `findByDate(date: Date)`
   - `findByDateRange(accountId: string, from: Date, to: Date)`

#### ❌ Use Cases à Créer

1. **`calculateDailyInterest`** - Calculer intérêts journaliers

   - CRON quotidien (minuit)
   - Pour chaque compte épargne :
     - Récupérer le solde du jour
     - Récupérer le taux en vigueur
     - Calculer intérêts = (solde × taux) / 365
     - Sauvegarder DailyInterest
   - Output : void

2. **`creditDailyInterest`** - Créditer les intérêts

   - Mode DAILY : Créer Transaction chaque jour
   - Mode MONTHLY : Accumuler puis créditer fin de mois
   - Input : `accountId`, `mode`
   - Output : void

3. **`updateSavingsRate`** - Modifier le taux (Directeur)

   - Input : `newRate`, `dateEffect`
   - Créer nouveau SavingsRate
   - Déclencher notification à tous les clients épargne
   - Output : SavingsRate

4. **`getSavingsRateHistory`** - Historique des taux

   - Output : List<SavingsRate>

5. **`notifyCustomersOfRateChange`** - Notification

   - Récupérer tous les clients avec compte épargne
   - Envoyer email/notification
   - Input : `newRate`
   - Output : void

6. **`getAccountInterestHistory`** - Historique intérêts d'un compte
   - Input : `accountId`
   - Output : List<DailyInterest>

#### 🗄️ Schéma Base de Données

**Table `savings_rates`**

```sql
CREATE TABLE savings_rates (
  id VARCHAR(255) PRIMARY KEY,
  rate DECIMAL(5,4) NOT NULL,
  date_effect TIMESTAMP NOT NULL
);
```

**Table `daily_interests`**

```sql
CREATE TABLE daily_interests (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  calculation_base INTEGER NOT NULL,
  applied_rate DECIMAL(5,4) NOT NULL,
  calculated_interest INTEGER NOT NULL,
  credit_mode VARCHAR(50) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

---

### 🎯 **Investissements - Fonctionnalités Avancées**

**Statut** : ⚠️ Phase 1 complétée

#### ❌ Améliorations Possibles

1. **Exécution partielle des ordres**

   - Actuellement : matching complet uniquement (100 = 100)
   - Amélioration : permettre partiel (100 peut matcher 60, reste 40 actif)
   - Complexité : +++

2. **Types d'ordres avancés**

   - Market orders (au prix du marché)
   - Stop-loss / Stop-limit
   - Trailing stop
   - Complexité : ++

3. **Historique de prix**

   - Sauvegarder l'évolution du prix par action
   - Graphiques de cours
   - Table `share_price_history`
   - Complexité : +

4. **Notifications ordres exécutés**

   - Email/WebSocket quand ordre exécuté
   - Complexité : +

5. **Statistiques & Analytics**
   - Performance du portefeuille
   - Gain/perte par action
   - Dividendes (si implémenté)
   - Complexité : ++

---

## 🟡 PRIORITÉ 3 - FONCTIONNALITÉS AVANCÉES

### 👑 **Gestion Directeur**

#### ❌ Use Cases Manquants

1. **`banUser`** - Bannir un utilisateur

   - Input : `userId`, `reason`
   - Changer User.status → BANNED
   - Bloquer toutes les sessions actives
   - Output : void

2. **`unbanUser`** - Débannir un utilisateur

   - Input : `userId`
   - Changer User.status → ACTIVE
   - Output : void

3. **`deleteUser`** - Supprimer un utilisateur

   - Vérifier que tous les comptes sont fermés
   - Vérifier qu'il n'y a pas de crédits en cours
   - Anonymiser les données (RGPD)
   - Output : void

4. **`updateShare`** - Modifier une action

   - Input : `shareId`, `name`, `symbol`, `totalNumberOfParts`
   - ⚠️ Ne PAS permettre modification du prix (calculé auto)
   - Output : Share

5. **`deleteShare`** - Supprimer une action

   - Vérifier qu'il n'y a pas d'ordres actifs
   - Vérifier qu'aucun client ne possède cette action
   - Output : void

6. **`activateShare`** - Activer une action

   - Permettre le trading
   - Output : void

7. **`deactivateShare`** - Désactiver une action

   - Bloquer les nouveaux ordres
   - Ne pas annuler les ordres existants
   - Output : void

8. **`getAllUsersWithStats`** - Liste utilisateurs avec stats
   - Nombre de comptes
   - Solde total
   - Crédits en cours
   - Output : List<UserStats>

---

### 📊 **Rapports & Statistiques**

#### ❌ Use Cases à Créer

1. **`getUserDashboard`** - Dashboard client

   - Solde total tous comptes
   - Valeur portefeuille actions
   - Crédits en cours
   - Prochaines échéances
   - Output : UserDashboard

2. **`getPortfolioPerformance`** - Performance portefeuille

   - Gain/perte par action
   - Performance globale
   - Input : `customerId`
   - Output : PortfolioPerformance

3. **`getBankStatistics`** - Statistiques banque (Directeur)

   - Nombre de clients actifs
   - Encours total crédits
   - Volume transactions
   - Actions les plus tradées
   - Output : BankStatistics

4. **`getAdvisorPerformance`** - Performance conseiller
   - Nombre de crédits accordés
   - Montant total
   - Taux de remboursement
   - Input : `advisorId`
   - Output : AdvisorPerformance

---

### 🔔 **Notifications & Alertes**

#### ❌ Fonctionnalités

1. **Notifications email**

   - Confirmation transfert
   - Ordre exécuté
   - Échéance à venir
   - Changement taux épargne

2. **Notifications WebSocket (temps réel)**

   - Nouveau message conseiller
   - Ordre exécuté
   - Transfert validé

3. **Préférences utilisateur**
   - Activer/désactiver par type
   - Fréquence (immédiat, quotidien, hebdomadaire)

---

## 🚧 INFRASTRUCTURE & TECHNIQUE

### ❌ Tâches Techniques Restantes

1. **Tests Unitaires**

   - Couverture actuelle : ~0%
   - Cible : 80%+ sur use cases
   - Framework : Jest

2. **Tests d'Intégration**

   - Scénarios end-to-end
   - Tests API (Postman collections)

3. **Migration Base de Données**

   - Scripts SQL pour tables manquantes
   - Seed data pour dev/test

4. **Documentation API**

   - Swagger/OpenAPI
   - Exemples de requêtes
   - Codes d'erreur

5. **Validation des données**

   - Schémas Joi/Zod
   - Validation côté client ET serveur

6. **Gestion des erreurs**

   - Centraliser les error handlers
   - Logs structurés
   - Monitoring (Sentry, DataDog)

7. **Performance**

   - Indexes base de données
   - Cache (Redis)
   - Pagination obligatoire

8. **Sécurité**

   - Rate limiting
   - CORS configuré
   - Validation IBAN stricte
   - Protection CSRF

9. **Frontend Next.js**

   - Pages manquantes pour nouvelles features
   - Composants réutilisables
   - State management (Zustand/Redux)

10. **CI/CD**
    - Pipeline GitHub Actions
    - Tests automatiques
    - Déploiement automatique

---

## 📊 RÉSUMÉ DES EFFORTS

| Catégorie               | Backend  | Frontend | Effort Frontend |
| ----------------------- | -------- | -------- | --------------- |
| ✅ **Authentification** | ✅ 6/6   | ✅ 2/2   | ✅ Complété     |
| ✅ **Comptes**          | ✅ 8/8   | ⚠️ 3/5   | 🟢 Faible       |
| ✅ **Transferts**       | ✅ 5/5   | ❌ 0/2   | 🟠 Moyen        |
| ✅ **Transactions**     | ✅ 3/3   | ✅ OK    | ✅ Complété     |
| ✅ **Investissements**  | ✅ 11/11 | ❌ 0/4   | 🔴 Élevé        |
| ✅ **Crédits**          | ✅ 10/10 | ❌ 0/2   | 🟠 Moyen        |
| ✅ **Conversations**    | ✅ 9/9   | ❌ 0/2   | 🟠 Moyen        |
| 🔴 **Épargne**          | ❌ 0/6   | ❌ 0/2   | 🔴 Élevé        |
| 🟡 **Directeur**        | ⚠️ 2/8   | ❌ 0/4   | 🟠 Moyen        |
| 🟡 **Stats/Rapports**   | ❌ 0/4   | ❌ 0/4   | 🟠 Moyen        |

**État actuel** : Backend ~85% complet | Frontend ~15% complet
**Effort restant** : Épargne (backend) + Tout le frontend sauf comptes

---

## 🎯 ROADMAP SUGGÉRÉE

### **Sprint 1** - Épargne (Backend Critique)

- ✅ ~~Backend comptes, transferts, investissements, crédits~~
- ❌ Entités SavingsRate & DailyInterest
- ❌ Repositories épargne
- ❌ Use cases calcul intérêts
- ❌ CRON job quotidien

### **Sprint 2** - Frontend Transferts

- ❌ Page `/dashboard/transfers` - Liste
- ❌ Page `/dashboard/transfers/new` - Créer
- ❌ API client transferts
- ❌ Composants réutilisables

### **Sprint 3** - Frontend Investissements

- ❌ Page `/dashboard/shares` - Liste actions
- ❌ Page `/dashboard/shares/[id]` - Détail + carnet d'ordres
- ❌ Page `/dashboard/portfolio` - Mon portefeuille
- ❌ Page `/dashboard/orders` - Mes ordres

### **Sprint 4** - Frontend Crédits & Messages

- ❌ Page `/dashboard/credits` - Mes crédits
- ❌ Page `/dashboard/credits/[id]` - Détail
- ❌ Page `/dashboard/messages` - Conversations
- ❌ Notifications temps réel

### **Sprint 5** - Admin & Polish

- ❌ Pages directeur (/admin/\*)
- ❌ Pages conseiller (/advisor/\*)
- ❌ Use cases directeur manquants
- ❌ Tests & Documentation

---

## 📌 NOTES IMPORTANTES

### ⚠️ Points d'Attention

1. **Calcul des Mensualités**

   - Formule : `M = P × (r(1+r)^n) / ((1+r)^n - 1)`
   - P = montant emprunté
   - r = taux mensuel (annualRate / 12 / 100)
   - n = nombre de mensualités

2. **Intérêts Épargne**

   - Formule quotidienne : `intérêt = solde × (taux / 365)`
   - Tenir compte des années bissextiles

3. **IBAN Validation**

   - Algorithme mod-97
   - Format FR76 XXXX XXXX XXXX XXXX XXXX XXX

4. **Transactions Atomiques**

   - Toujours utiliser UnitOfWork pour :
     - Transferts (2 transactions)
     - Exécution ordres (multiples updates)
     - Crédits (transaction + échéances)

5. **Performances**
   - Pagination obligatoire pour :
     - Transactions (potentiellement milliers)
     - Historique transferts
     - Messages conversations
   - Indexes sur :
     - `transactions.account_iban`
     - `transactions.date`
     - `orders.share_id + status`
     - `due_dates.due_date + status`

---

## 🔗 RESSOURCES

- [README.md](./README.md) - Documentation complète
- [Postman Collection](./postman/) - Tests API
- Architecture : Clean Architecture (Uncle Bob)
- Base : PostgreSQL + InMemory (tests)

---

**🚀 Bon courage pour la suite du développement !**
