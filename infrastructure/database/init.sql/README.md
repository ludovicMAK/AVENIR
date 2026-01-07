# Database Initialization

Ce dossier contient les scripts d'initialisation de la base de données PostgreSQL pour l'application AVENIR.

## Structure

Les fichiers sont exécutés par ordre alphabétique au démarrage du conteneur PostgreSQL :

1. `001_transfers_transactions.sql` - Crée toutes les tables et insère les données de test

## Schéma de la base de données

### Tables principales

- **users** : Utilisateurs (clients, conseillers, managers)
- **accounts** : Comptes bancaires (courant, épargne, titres)
- **transfers** : Virements
- **transactions** : Transactions bancaires
- **credits** : Crédits
- **due_dates** : Échéances de crédit
- **shares** : Actions
- **securities_positions** : Positions en titres
- **orders** : Ordres d'achat/vente
- **share_transactions** : Transactions boursières
- **conversations** : Conversations client-conseiller
- **messages** : Messages
- **sessions** : Sessions utilisateur

## Données de test

### Compte Admin Principal

- **Email** : `admin@avenir.com`
- **Mot de passe** : `Admin123!`
- **IBAN** : `FR76 3000 6000 0112 3456 7890 189`
- **Solde** : 10 000,00 €
- **Découvert autorisé** : 1 000,00 €

### Comptes Clients

1. **Jean Martin** (`jean.martin@gmail.com`)

   - Mot de passe : `Admin123!`
   - Compte courant : `FR76 1234 5678 9012 3456 7890 123` (2 500 €)
   - Livret A : `FR76 9876 5432 1098 7654 3210 987` (5 000 €)
   - A un crédit actif de 20 000 €

2. **Sophie Bernard** (`sophie.bernard@gmail.com`)

   - Mot de passe : `Admin123!`
   - Compte courant : `FR76 1111 2222 3333 4444 5555 666` (1 500 €)
   - Compte titres : `FR76 7777 8888 9999 0000 1111 222` (10 000 €)
   - Possède des actions TechCorp et GreenEnergy
   - A un crédit immobilier de 150 000 €

3. **Luc Petit** (`luc.petit@gmail.com`)
   - Mot de passe : `Admin123!`
   - Compte courant : `FR76 3333 4444 5555 6666 7777 888` (500 €)
   - ⚠️ Email NON vérifié (pour tester les restrictions)

### Conseiller

- **Marie Dupont** (`marie.dupont@avenir.com`)
  - Mot de passe : `Admin123!`
  - Rôle : Conseiller bancaire

## Données incluses

- ✅ 2 transferts complétés avec leurs transactions
- ✅ 2 crédits actifs avec échéances
- ✅ 3 actions disponibles à la négociation
- ✅ Positions en titres et ordres actifs
- ✅ Conversations et messages
- ✅ Transactions historiques

## Réinitialisation de la base de données

Pour recréer complètement la base de données avec les données de test :

```bash
docker-compose down -v
docker-compose up -d
```

Le flag `-v` supprime les volumes Docker, ce qui efface complètement la base de données.

## Sécurité

⚠️ **ATTENTION** : Les mots de passe dans ce fichier sont des exemples pour le développement.
En production :

1. Utiliser des mots de passe forts et uniques
2. Hacher correctement avec bcrypt
3. Ne JAMAIS committer de vraies données sensibles
