# 📝 TODO - Fonctionnalités Restantes AVENIR

**Dernière mise à jour** : 6 janvier 2026  
**Branche** : `investissement`

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

---

## 🔴 PRIORITÉ 1 - FONCTIONNALITÉS CRITIQUES

### 🏦 **Système de Transferts Complet**

**Statut** : ⚠️ Partiel (1/6 use cases)

#### ❌ Use Cases Manquants

1. **`createTransfer`** - Créer un transfert entre comptes

   - Input : `sourceAccountIBAN`, `targetAccountIBAN`, `amount`, `description`
   - Validation : vérifier que les deux comptes existent et appartiennent à la banque
   - Créer Transfer avec status `PENDING`
   - Ne pas exécuter immédiatement (attente validation)
   - Output : Transfer créé

2. **`executeTransfer`** - Exécuter un transfert validé

   - Input : `transferId`
   - Vérifier status = `PENDING`
   - Créer 2 transactions (DEBIT source, CREDIT target)
   - Mettre à jour les balances des comptes
   - Changer status → `EXECUTED`
   - UnitOfWork pour atomicité
   - Output : Transfer exécuté

3. **`getTransferHistory`** - Historique des transferts

   - Par compte (IBAN)
   - Par utilisateur (customerId)
   - Filtres : date, status, montant
   - Pagination recommandée
   - Output : List<Transfer>

4. **`cancelTransfer`** - Annuler un transfert en attente

   - Input : `transferId`, `userId`
   - Vérifier que l'utilisateur est propriétaire du compte source
   - Vérifier status = `PENDING`
   - Changer status → `CANCELLED`
   - Output : void

5. **`getTransferById`** - Récupérer un transfert

   - Input : `transferId`
   - Output : Transfer | null

6. **`getTransfersByAccount`** - Transferts d'un compte
   - Input : `accountId` ou `IBAN`
   - Inclure émis ET reçus
   - Output : List<Transfer>

#### 📊 Repositories à Étendre

- ✅ `TransferRepository` existe déjà
- ❌ Ajouter méthodes :
  - `findByAccountId(accountId: string)`
  - `findByCustomerId(customerId: string)`
  - `findByStatus(status: StatusTransfer)`
  - `findByDateRange(from: Date, to: Date)`

---

### 💰 **Calcul du Solde des Comptes**

**Statut** : ❌ Non implémenté

#### ❌ Use Cases Manquants

1. **`getAccountBalance`** - Calculer le solde d'un compte

   - Input : `accountId` ou `IBAN`
   - Logique : Somme de toutes les transactions validées (CREDIT - DEBIT)
   - Prendre en compte `availableBalance` (fonds bloqués)
   - Output : `{ balance: number, availableBalance: number, blockedAmount: number }`

2. **`getAccountTransactions`** - Transactions d'un compte

   - Input : `accountId`, filtres (date, type, status)
   - Pagination nécessaire
   - Trier par date décroissante
   - Output : List<Transaction>

3. **`getAccountStatement`** - Relevé de compte
   - Input : `accountId`, `fromDate`, `toDate`
   - Générer un relevé avec :
     - Solde initial
     - Liste des transactions
     - Solde final
   - Output : AccountStatement

#### 📊 Repositories à Créer/Étendre

- ✅ `TransactionRepository` existe
- ❌ Ajouter :
  - `findByAccountIBAN(iban: string)`
  - `findByDateRange(iban: string, from: Date, to: Date)`
  - `calculateBalance(iban: string)` - Requête SQL optimisée

---

### 💳 **Crédits (Complètement Absent)**

**Statut** : ❌ 0% - Entités manquantes

#### ❌ Entités à Créer

1. **`Credit`** (domain/entities/credit.ts)

   ```typescript
   class Credit {
     id: string;
     amountBorrowed: number;
     annualRate: number;
     insuranceRate: number;
     durationInMonths: number;
     startDate: Date;
     status: CreditStatus; // IN_PROGRESS, COMPLETED
     customerId: string;
     advisorId: string;
   }
   ```

2. **`DueDate`** (domain/entities/dueDate.ts)
   ```typescript
   class DueDate {
     id: string;
     dueDate: Date;
     totalAmount: number;
     interestShare: number;
     insuranceShare: number;
     repaymentPortion: number;
     status: DueDateStatus; // PAYABLE, PAID, OVERDUE
     paymentDate?: Date;
     creditId: string;
   }
   ```

#### ❌ Value Objects à Créer

- `CreditStatus` (IN_PROGRESS, COMPLETED)
- `DueDateStatus` (PAYABLE, PAID, OVERDUE)

#### ❌ Repositories à Créer

1. **`CreditRepository`**

   - `save(credit: Credit)`
   - `findById(id: string)`
   - `findByCustomerId(customerId: string)`
   - `findByAdvisorId(advisorId: string)`
   - `findByStatus(status: CreditStatus)`
   - `updateStatus(id: string, status: CreditStatus)`

2. **`DueDateRepository`**
   - `save(dueDate: DueDate)`
   - `findById(id: string)`
   - `findByCreditId(creditId: string)`
   - `findByStatus(status: DueDateStatus)`
   - `findUpcoming(customerId: string, days: number)`
   - `updateStatus(id: string, status: DueDateStatus)`
   - `recordPayment(id: string, paymentDate: Date)`

#### ❌ Use Cases à Créer

1. **`grantCredit`** - Octroyer un crédit (Conseiller)

   - Input : `customerId`, `amountBorrowed`, `annualRate`, `insuranceRate`, `durationInMonths`
   - Vérifier que l'utilisateur est conseiller
   - Créer Credit
   - Générer tableau d'amortissement (DueDates)
   - Créditer le compte client (Transaction)
   - Output : Credit avec DueDates

2. **`calculateAmortizationSchedule`** - Calculer le tableau

   - Input : `amountBorrowed`, `annualRate`, `insuranceRate`, `durationInMonths`
   - Formule : Mensualités constantes
   - Assurance = taux fixe sur montant total
   - Intérêts = calculés sur capital restant
   - Output : List<DueDatePreview>

3. **`getCreditsByCustomer`** - Crédits d'un client

   - Input : `customerId`
   - Output : List<Credit>

4. **`payDueDate`** - Payer une échéance

   - Input : `dueDateId`, `accountId`
   - Vérifier fonds disponibles
   - Créer Transaction DEBIT
   - Mettre à jour status → PAID
   - Output : void

5. **`getUpcomingDueDates`** - Échéances à venir

   - Input : `customerId`, `days` (ex: 30 jours)
   - Output : List<DueDate>

6. **`handleOverdueDueDate`** - Gérer les impayés
   - Tâche CRON quotidienne
   - Trouver toutes les DueDates PAYABLE avec date < aujourd'hui
   - Changer status → OVERDUE
   - Notifier le client (optionnel)
   - Output : void

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

| Catégorie                      | Entités | Use Cases | Repositories | Effort      |
| ------------------------------ | ------- | --------- | ------------ | ----------- |
| ✅ **Investissements Phase 1** | 0       | 4         | 0            | ✅ Complété |
| 🔴 **Transferts**              | 0       | 6         | 0 (extend)   | 🟠 Moyen    |
| 🔴 **Solde/Transactions**      | 0       | 3         | 0 (extend)   | 🟢 Faible   |
| 🔴 **Crédits**                 | 2       | 6         | 2            | 🔴 Élevé    |
| 🟠 **Épargne**                 | 2       | 6         | 2            | 🔴 Élevé    |
| 🟡 **Directeur**               | 0       | 8         | 0 (extend)   | 🟠 Moyen    |
| 🟡 **Notifications**           | 0       | 3         | 1            | 🟠 Moyen    |
| 🟡 **Stats/Rapports**          | 0       | 4         | 0            | 🟠 Moyen    |

**Total estimé** : ~40-50 use cases, 4 entités, 4 repositories, ~80-100h de dev

---

## 🎯 ROADMAP SUGGÉRÉE

### **Sprint 1 (Semaine 1)** - Fondations

- ✅ ~~Investissements Phase 1~~
- Système transferts complet
- Calcul solde & transactions

### **Sprint 2 (Semaine 2)** - Crédits

- Entités Credit & DueDate
- Repositories
- Use cases crédits de base
- Schéma BDD + migrations

### **Sprint 3 (Semaine 3)** - Épargne

- Entités SavingsRate & DailyInterest
- Repositories
- Calcul intérêts journaliers
- CRON jobs

### **Sprint 4 (Semaine 4)** - Directeur & Avancé

- Gestion utilisateurs (ban/unban)
- CRUD actions
- Notifications
- Dashboard

### **Sprint 5 (Semaine 5)** - Polish & Tests

- Tests unitaires
- Tests d'intégration
- Documentation
- Frontend manquant

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
