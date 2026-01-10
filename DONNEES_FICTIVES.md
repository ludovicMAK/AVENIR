# 📊 Documentation des Données Fictives

Ce document décrit l'ensemble des données de test créées dans le fichier `infrastructure/database/init.sql/001_init_database.sql`.

---

## 🔐 Informations de Connexion

**Tous les comptes utilisent le même mot de passe** : `Admin123!`

**Hash du mot de passe** : `3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121`

---

## 👥 Utilisateurs (16 au total)

### 🏦 Directeur de Banque (1)

| Nom            | Email                     | ID                                   | Compte Principal |
|----------------|---------------------------|--------------------------------------|------------------|
| Laurent Dubois | laurent.dubois@avenir.com | 00000000-0000-4000-8000-000000000001 | 500 000€         |

**Rôle** : Peut créer/modifier/supprimer des actions, fixer les taux d'épargne, gérer les utilisateurs.

**Compte** : Le directeur possède le compte le plus important de la banque avec 500 000€ pour effectuer des virements vers les clients.

---

### 💼 Conseillers Bancaires (5)

| Nom           | Email                      | ID                                   |
|---------------|----------------------------|--------------------------------------|
| Marie Dupont  | marie.dupont@avenir.com    | 00000000-0000-4000-8000-000000000011 |
| Pierre Moreau | pierre.moreau@avenir.com   | 00000000-0000-4000-8000-000000000012 |
| Julie Laurent | julie.laurent@avenir.com   | 00000000-0000-4000-8000-000000000013 |
| Marc Simon    | marc.simon@avenir.com      | 00000000-0000-4000-8000-000000000014 |
| Émilie Michel | emilie.michel@avenir.com   | 00000000-0000-4000-8000-000000000015 |

**Rôle** : Peuvent octroyer des crédits, répondre aux messages clients, transférer des conversations.

---

### 👤 Clients (10)

| Nom               | Email                     | ID                                   | Profil                        |
|-------------------|---------------------------|--------------------------------------|-------------------------------|
| Jean Martin       | jean.martin@gmail.com     | 00000000-0000-4000-8000-000000000101 | Investisseur débutant         |
| Sophie Bernard    | sophie.bernard@gmail.com  | 00000000-0000-4000-8000-000000000102 | Investisseuse active          |
| Luc Petit         | luc.petit@gmail.com       | 00000000-0000-4000-8000-000000000103 | Jeune client avec crédit      |
| Alice Durand      | alice.durand@gmail.com    | 00000000-0000-4000-8000-000000000104 | Grande investisseuse          |
| Paul Leroy        | paul.leroy@gmail.com      | 00000000-0000-4000-8000-000000000105 | Investisseur moyen            |
| Emma Bonnet       | emma.bonnet@gmail.com     | 00000000-0000-4000-8000-000000000106 | Investisseuse prudente        |
| Hugo Lambert      | hugo.lambert@gmail.com    | 00000000-0000-4000-8000-000000000107 | Client avec crédit terminé    |
| Léa Garcia        | lea.garcia@gmail.com      | 00000000-0000-4000-8000-000000000108 | Petite investisseuse          |
| Noah Fontaine     | noah.fontaine@gmail.com   | 00000000-0000-4000-8000-000000000109 | Client simple (1 compte)      |
| Chloé Chevalier   | chloe.chevalier@gmail.com | 00000000-0000-4000-8000-000000000110 | Très active en bourse         |

---

## 💰 Comptes Bancaires (26 comptes)

### Répartition par Type

- **Comptes Courants** : 11 (dont 1 compte directeur)
- **Comptes Épargne** : 8
- **Comptes Trading** : 7

### Soldes Totaux

- **Total tous comptes** : ~750 000€
- **Compte Directeur** : 500 000€ (pour faire des virements aux clients)
- **Total clients** : ~250 000€
- **Moyenne par client** : ~25 000€
- **Plus gros compte client** : Chloé Chevalier Trading (35 000€)
- **Plus petit compte** : Noah Fontaine (900€)

### Exemples de Comptes

**Laurent Dubois - Directeur** (1 compte) :
- Compte Directeur : 500 000€ (découvert autorisé 10 000€)
- **But** : Effectuer des virements tests vers les clients

**Jean Martin** (3 comptes) :
- Compte Courant : 3 500€ (découvert autorisé 500€)
- Livret A : 8 000€
- Compte Titres : 15 000€ (disponible : 14 000€)

**Sophie Bernard** (3 comptes) :
- Compte Principal : 2 800€
- Épargne Projet : 12 000€
- Portefeuille Actions : 25 000€ (disponible : 24 000€)

---

## 🔄 Virements et Transactions (15 virements + 35 transactions)

### Virements par Statut

- **Validés** : 10 virements (total : ~7 600€)
- **En attente** : 3 virements (total : ~2 300€)
- **Annulés** : 2 virements (total : ~5 100€)

### Types de Transactions

1. **Virements entre comptes** (18 transactions)
2. **Intérêts d'épargne** (5 transactions, total : +960€)
3. **Frais bancaires** (3 transactions, total : -22.50€)
4. **Salaires mensuels** (4 transactions, total : +16 000€)
5. **Transactions en attente** (3 transactions)

### Exemple de Flux

```
Jean Martin → Sophie Bernard : 450€ (validé)
Alice Durand → Paul Leroy : 600€ (validé)
Sophie Bernard → Jean Martin : 1 200€ (en attente)
```

---

## 📈 Crédits (8 crédits)

### Vue d'Ensemble

| Client          | Montant  | Taux   | Durée  | Mensualité | Statut      | Payées | Restantes |
|-----------------|----------|--------|--------|------------|-------------|--------|-----------|
| Jean Martin     | 10 000€  | 3.50%  | 12 mois| 862€       | En cours    | 3/12   | 9         |
| Sophie Bernard  | 25 000€  | 4.00%  | 24 mois| 1 100€     | En cours    | 8/24   | 16        |
| Luc Petit       | 5 000€   | 3.00%  | 12 mois| 430€       | En cours    | 1/12   | 11        |
| Alice Durand    | 50 000€  | 4.50%  | 60 mois| 950€       | En cours    | 12/60  | 48        |
| Paul Leroy      | 15 000€  | 3.80%  | 24 mois| 670€       | En cours    | 6/24   | 18        |
| Emma Bonnet     | 8 000€   | 3.20%  | 18 mois| 470€       | En cours    | 4/18   | 14        |
| Hugo Lambert    | 12 000€  | 3.50%  | 12 mois| 1 035€     | Terminé     | 12/12  | 0         |
| Chloé Chevalier | 35 000€  | 4.20%  | 36 mois| 1 060€     | En cours    | 10/36  | 26        |

### Statistiques

- **Total emprunté** : 160 000€
- **Total mensualités** : ~6 577€/mois
- **Crédits actifs** : 7
- **Crédits terminés** : 1
- **Échéances à payer aujourd'hui** : 7

---

## 📊 Actions et Investissements

### 10 Actions Disponibles

| Action              | Prix Initial | Dernier Prix | Évolution | Parts Totales |
|---------------------|--------------|--------------|-----------|---------------|
| TechNova Corp       | 100.00€      | 105.50€      | +5.50%    | 1 000 000     |
| GreenEnergy SA      | 50.00€       | 52.30€       | +4.60%    | 500 000       |
| BioHealth Labs      | 75.00€       | 78.90€       | +5.20%    | 800 000       |
| FinanceFirst        | 120.00€      | 118.75€      | -1.04%    | 600 000       |
| AutoDrive Tech      | 85.00€       | 92.40€       | +8.71%    | 750 000       |
| FoodChain Global    | 45.00€       | 47.80€       | +6.22%    | 400 000       |
| CloudNet Services   | 150.00€      | 165.20€      | +10.13%   | 900 000       |
| Quantum Computing   | 200.00€      | -            | Nouvelle  | 300 000       |
| EcoConstruct        | 60.00€       | 58.50€       | -2.50%    | 550 000       |
| MediCare Plus       | 95.00€       | 99.10€       | +4.32%    | 700 000       |

**Meilleure performance** : CloudNet Services (+10.13%)
**Pire performance** : EcoConstruct (-2.50%)

---

### Positions des Investisseurs (23 positions)

#### Top 3 Portefeuilles (par valeur)

1. **Chloé Chevalier** : ~45 000€
   - 200 TechNova Corp
   - 100 AutoDrive Tech
   - 120 CloudNet Services
   - 85 EcoConstruct

2. **Alice Durand** : ~42 000€
   - 150 TechNova Corp
   - 80 FinanceFirst
   - 90 CloudNet Services
   - 70 MediCare Plus

3. **Sophie Bernard** : ~32 000€
   - 100 TechNova Corp
   - 75 BioHealth Labs
   - 60 AutoDrive Tech
   - 40 CloudNet Services

---

### Ordres (30 ordres)

#### Ordres Actifs

**Ordres d'Achat (10)** :
- Jean Martin : 10 TechNova à 106€
- Sophie Bernard : 5 FinanceFirst à 120€
- Alice Durand : 20 GreenEnergy à 53€
- Paul Leroy : 8 CloudNet à 166€
- Emma Bonnet : 12 MediCare à 100€
- Léa Garcia : 3 Quantum à 205€
- Chloé Chevalier : 15 BioHealth à 80€
- ... et plus

**Ordres de Vente (10)** :
- Jean Martin : 10 TechNova à 108€
- Sophie Bernard : 20 BioHealth à 82€
- Alice Durand : 20 CloudNet à 168€
- Paul Leroy : 15 GreenEnergy à 54€
- Emma Bonnet : 10 BioHealth à 81€
- ... et plus

#### Ordres Exécutés (5)

1. Sophie achète 50 TechNova de Chloé à 104€
2. Alice achète 30 AutoDrive de Chloé à 90€
3. Paul achète 40 EcoConstruct à 58€

#### Ordres Annulés (5)

- Ordres expirés ou annulés par les clients

---

### Transactions d'Actions (3 transactions)

| Date             | Acheteur       | Vendeur         | Action         | Qté | Prix  | Total     |
|------------------|----------------|-----------------|----------------|-----|-------|-----------|
| Il y a 10 jours  | Sophie Bernard | Chloé Chevalier | TechNova       | 50  | 104€  | 5 200€    |
| Il y a 5 jours   | Alice Durand   | Chloé Chevalier | AutoDrive      | 30  | 90€   | 2 700€    |
| Il y a 3 jours   | Paul Leroy     | (système)       | EcoConstruct   | 40  | 58€   | 2 320€    |

**Frais totaux perçus** : 600€ (100€ par partie × 6 parties)

---

## 💬 Messagerie (12 conversations + 36 messages)

### Conversations par Statut

- **Ouvertes** : 6 conversations
- **Transférées** : 3 conversations
- **Fermées** : 3 conversations

### Conversations Actives (exemples)

#### 1. Jean Martin ↔ Marie Dupont
**Sujet** : Question sur crédit immobilier
**Statut** : Ouverte (il y a 2 jours)
**Messages** : 4

#### 2. Sophie Bernard ↔ Pierre Moreau
**Sujet** : Conseils investissements
**Statut** : Ouverte (il y a 5 jours)
**Messages** : 5

#### 3. Alice Durand ↔ Marc Simon
**Sujet** : URGENT - Carte bancaire bloquée
**Statut** : Ouverte (il y a 3 heures) ✅ Résolu
**Messages** : 4

#### 4. Emma Bonnet ↔ Pierre Moreau + Marc Simon
**Sujet** : Projet d'investissement complexe
**Statut** : Ouverte (il y a 10 jours)
**Type** : Conversation de groupe
**Messages** : 4

### Conversations Transférées

#### Hugo Lambert : Marie Dupont → Julie Laurent
**Raison** : Spécialisation en gestion de découvert
**Date** : Il y a 14 jours

#### Léa Garcia : Pierre Moreau → Émilie Michel
**Raison** : Spécialisation en investissements boursiers
**Date** : Il y a 19 jours

#### Noah Fontaine : Marie Dupont → Émilie Michel
**Raison** : Client souhaite un conseiller différent
**Date** : Il y a 11 jours

### Répartition des Conseillers

| Conseiller     | Conversations Actives | Total Traitées |
|----------------|-----------------------|----------------|
| Marie Dupont   | 1                     | 4              |
| Pierre Moreau  | 2                     | 3              |
| Julie Laurent  | 2                     | 3              |
| Marc Simon     | 2                     | 3              |
| Émilie Michel  | 2                     | 3              |

---

## 🎯 Scénarios de Test Disponibles

### 1. Test Complet Investissements

**Utilisateur** : Sophie Bernard (`sophie.bernard@gmail.com`)

✅ A 3 comptes (courant, épargne, trading avec 25 000€)
✅ Possède 4 positions (275 actions)
✅ A des ordres actifs d'achat et de vente
✅ A effectué des transactions récentes
✅ A une conversation active avec Pierre Moreau

**Tests possibles** :
- Voir le portefeuille complet
- Placer un nouvel ordre d'achat
- Placer un ordre de vente
- Annuler un ordre en attente
- Consulter l'historique des transactions

---

### 2. Test Complet Crédits

**Utilisateur** : Jean Martin (`jean.martin@gmail.com`)

✅ A un crédit de 10 000€ sur 12 mois
✅ 3 échéances payées, 9 restantes
✅ Prochaine échéance : aujourd'hui (862€)
✅ A un compte courant avec 3 500€
✅ A une conversation ouverte avec Marie Dupont

**Tests possibles** :
- Consulter le détail du crédit
- Voir le tableau d'amortissement
- Payer l'échéance du mois
- Simuler un remboursement anticipé
- Simuler un nouveau crédit

---

### 3. Test Complet Messagerie

**Utilisateur** : Alice Durand (`alice.durand@gmail.com`)

✅ A 2 conversations (1 ouverte récente, 1 fermée)
✅ Conversation urgente résolue (carte bancaire)
✅ Attribuée au conseiller Marc Simon
✅ Historique de messages varié

**Tests possibles** :
- Voir la liste des conversations
- Consulter l'historique d'une conversation
- Envoyer un nouveau message
- Créer une nouvelle conversation
- Voir les conversations fermées

---

### 4. Test Complet Transferts

**Utilisateur** : Luc Petit (`luc.petit@gmail.com`)

✅ A 2 comptes (courant 1 200€, épargne 3 500€)
✅ A fait un virement récemment
✅ Découvert autorisé de 300€

**Tests possibles** :
- Faire un virement interne (courant → épargne)
- Faire un virement externe (vers autre client)
- Consulter l'historique des virements
- Télécharger un relevé de compte

---

### 5. Test Directeur de Banque

**Utilisateur** : Laurent Dubois (`laurent.dubois@avenir.com`)

✅ Rôle : Bank Manager
✅ Compte avec 500 000€
✅ Peut gérer toutes les entités

**Tests possibles** :
- Créer une nouvelle action
- Modifier le prix d'une action
- Supprimer une action
- Voir tous les clients
- Bannir un client (avec prudence !)
- Fixer le taux d'épargne
- Faire des virements importants vers les clients (jusqu'à 500 000€)

---

### 6. Test Conseiller Bancaire

**Utilisateur** : Marie Dupont (`marie.dupont@avenir.com`)

✅ Rôle : Bank Advisor
✅ A 1 conversation active (Jean Martin)
✅ A traité 4 conversations au total

**Tests possibles** :
- Voir les conversations en attente
- Répondre à Jean Martin
- Octroyer un crédit à un client
- Transférer une conversation à un collègue
- Fermer une conversation résolue

---

## 📊 Statistiques Globales

### Données Totales

- **Utilisateurs** : 16 (1 directeur, 5 conseillers, 10 clients)
- **Comptes** : 26 comptes pour ~750 000€ (dont 500 000€ pour le directeur)
- **Virements** : 15 (10 validés, 3 en attente, 2 annulés)
- **Transactions** : 35 transactions
- **Crédits** : 8 crédits pour 160 000€ empruntés
- **Échéances** : ~60 échéances (mix payées/à payer)
- **Actions** : 10 actions différentes
- **Positions** : 23 positions d'investissement
- **Ordres** : 30 ordres (20 actifs, 5 exécutés, 5 annulés)
- **Transactions d'actions** : 3 transactions exécutées
- **Conversations** : 12 conversations
- **Messages** : 36 messages
- **Participants** : 16 participations de conseillers
- **Transferts de conversations** : 3 transferts

### Ratios et Moyennes

- **Moyenne comptes par client** : 2.5 comptes
- **Solde moyen par compte** : 10 000€
- **Investisseurs actifs** : 7/10 clients (70%)
- **Crédit moyen** : 20 000€
- **Mensualité moyenne** : 822€
- **Taux d'intérêt moyen** : 3.71%
- **Valeur moyenne d'un portefeuille** : ~15 000€
- **Actions moyennes par investisseur** : ~40 actions

---

## 🚀 Utilisation

### Réinitialiser la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Supprimer et recréer la base
DROP DATABASE IF EXISTS avenir_bank;
CREATE DATABASE avenir_bank;

# Se connecter à la nouvelle base
\c avenir_bank

# Exécuter le script d'initialisation
\i infrastructure/database/init.sql/001_init_database.sql
```

### Connexion Rapide

**Clients** :
```
Email: sophie.bernard@gmail.com
Mot de passe: Admin123!
```

**Conseillers** :
```
Email: marie.dupont@avenir.com
Mot de passe: Admin123!
```

**Directeur** :
```
Email: laurent.dubois@avenir.com
Mot de passe: Admin123!
Compte: 500 000€
```

---

## ✅ Cohérence des Données

### Points de Cohérence Vérifiés

✅ **Soldes des comptes** : Reflètent les transactions
✅ **Montants bloqués** : Correspondent aux ordres actifs
✅ **Échéances des crédits** : Calculs mathématiques corrects
✅ **Positions d'actions** : Correspondent aux transactions
✅ **Conversations** : Participants et messages cohérents
✅ **Transferts** : Transactions de débit/crédit appariées
✅ **Dates** : Chronologie logique et réaliste

### Exemples de Cohérence

**Exemple 1 : Transaction d'action**
- Sophie achète 50 TechNova à Chloé à 104€
- Ordre d'achat de Sophie : statut = executed
- Ordre de vente de Chloé : statut = executed
- Transaction créée : 50 actions × 104€
- Position de Sophie : +50 TechNova
- Position de Chloé : -50 TechNova
- Comptes débité/crédité correctement

**Exemple 2 : Virement**
- Jean vire 450€ à Sophie
- Transfer créé avec statut 'validated'
- Transaction débit sur compte Jean : -450€
- Transaction crédit sur compte Sophie : +450€
- Dates identiques pour les deux transactions

**Exemple 3 : Crédit**
- Alice emprunte 50 000€ sur 60 mois à 4.5%
- 12 échéances payées (statut 'paid' avec payment_date)
- 48 échéances restantes (statut 'payable')
- Calculs d'intérêts dégressifs cohérents
- Part d'assurance constante (0.45% du total)

---

## 🎨 Personnalisation

Vous pouvez facilement ajouter plus de données en suivant les patterns existants :

### Ajouter un Client

```sql
INSERT INTO users (id, lastname, firstname, email, role, password, status, email_verified_at)
VALUES (
    uuid_generate_v4(),
    'Nouveau',
    'Client',
    'nouveau.client@gmail.com',
    'customer',
    '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
    'active',
    CURRENT_TIMESTAMP
);
```

### Ajouter une Action

```sql
INSERT INTO shares (id, name, total_number_of_parts, initial_price, last_executed_price)
VALUES (
    uuid_generate_v4(),
    'Nouvelle Entreprise SA',
    1000000,
    50.00,
    NULL
);
```

### Ajouter un Compte

```sql
INSERT INTO accounts (id, account_type, iban, account_name, status, id_owner, balance, available_balance)
VALUES (
    uuid_generate_v4(),
    'current',
    'FR76 1234 5678 9012 3456 7890 999',
    'Mon Nouveau Compte',
    'open',
    'USER_ID_ICI',
    5000.00,
    5000.00
);
```

---

## 📝 Notes Importantes

1. **UUIDs** : Les IDs utilisent des patterns reconnaissables (00000000-0000-0000-0000-0000000001XX) pour faciliter le debug.

2. **Dates** : Les dates utilisent des intervalles relatifs à `CURRENT_TIMESTAMP` pour rester cohérentes.

3. **Montants** : Les calculs de crédit sont approximatifs mais réalistes (mensualités constantes).

4. **Frais** : Les frais de transaction boursière sont fixes à 100 centimes (1€).

5. **Blocages** : Les montants bloqués dans les comptes trading correspondent aux ordres actifs.

---

**Toutes les données sont cohérentes et prêtes pour les tests ! 🎉**
