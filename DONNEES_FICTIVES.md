# Documentation des Données Fictives

Données de test créées dans `infrastructure/database/init.sql/001_init_database.sql`.

## Connexion

**Mot de passe unique pour tous les comptes** : `Admin123!`

## Utilisateurs

### Directeur (1)

**laurent.dubois@avenir.com** - Gestion actions, taux épargne, 500 000 EUR

### Conseillers (5)

- marie.dupont@avenir.com
- pierre.moreau@avenir.com
- julie.laurent@avenir.com
- marc.simon@avenir.com
- emilie.michel@avenir.com

**Privilèges** : Octroyer crédits, répondre aux messages, transférer conversations

### Clients (10)

| Email                     | Profil                     |
| ------------------------- | -------------------------- |
| jean.martin@gmail.com     | 3 comptes, crédit 10k EUR  |
| sophie.bernard@gmail.com  | Trading actif, 4 positions |
| luc.petit@gmail.com       | 2 comptes, crédit 5k EUR   |
| alice.durand@gmail.com    | Gros portefeuille 42k EUR  |
| paul.leroy@gmail.com      | Investisseur moyen         |
| emma.bonnet@gmail.com     | Investisseuse prudente     |
| hugo.lambert@gmail.com    | Crédit terminé             |
| lea.garcia@gmail.com      | Petite investisseuse       |
| noah.fontaine@gmail.com   | 1 compte simple            |
| chloe.chevalier@gmail.com | Très active en bourse      |

## Comptes Bancaires (26)

- Comptes Courants : 11
- Comptes Épargne : 8
- Comptes Trading : 7
- Total : ~750 000 EUR (dont 500 000 EUR directeur)

## Crédits (8)

| Client          | Montant    | Taux  | Durée   | Mensualité | Payées/Total |
| --------------- | ---------- | ----- | ------- | ---------- | ------------ |
| Jean Martin     | 10 000 EUR | 3.50% | 12 mois | 862 EUR    | 3/12         |
| Sophie Bernard  | 25 000 EUR | 4.00% | 24 mois | 1 100 EUR  | 8/24         |
| Luc Petit       | 5 000 EUR  | 3.00% | 12 mois | 430 EUR    | 1/12         |
| Alice Durand    | 50 000 EUR | 4.50% | 60 mois | 950 EUR    | 12/60        |
| Paul Leroy      | 15 000 EUR | 3.80% | 24 mois | 670 EUR    | 6/24         |
| Emma Bonnet     | 8 000 EUR  | 3.20% | 18 mois | 470 EUR    | 4/18         |
| Hugo Lambert    | 12 000 EUR | 3.50% | 12 mois | 1 035 EUR  | 12/12        |
| Chloé Chevalier | 35 000 EUR | 4.20% | 36 mois | 1 060 EUR  | 10/36        |

## Actions (10)

| Action            | Prix Initial | Dernier Prix |
| ----------------- | ------------ | ------------ |
| TechNova Corp     | 100.00 EUR   | 105.50 EUR   |
| GreenEnergy SA    | 50.00 EUR    | 52.30 EUR    |
| BioHealth Labs    | 75.00 EUR    | 78.90 EUR    |
| FinanceFirst      | 120.00 EUR   | 118.75 EUR   |
| AutoDrive Tech    | 85.00 EUR    | 92.40 EUR    |
| FoodChain Global  | 45.00 EUR    | 47.80 EUR    |
| CloudNet Services | 150.00 EUR   | 165.20 EUR   |
| Quantum Computing | 200.00 EUR   | -            |
| EcoConstruct      | 60.00 EUR    | 58.50 EUR    |
| MediCare Plus     | 95.00 EUR    | 99.10 EUR    |

## Données Globales

- 16 utilisateurs (1 directeur, 5 conseillers, 10 clients)
- 26 comptes bancaires
- 15 virements (10 validés, 3 en attente, 2 annulés)
- 35 transactions
- 8 crédits
- 10 actions
- 23 positions d'investissement
- 30 ordres boursiers
- 12 conversations
- 36 messages
