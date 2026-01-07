# AVENIR Database

## Démarrage rapide

1. Copier le fichier `.env.example` vers `.env`:

```bash
cp .env.example .env
```

2. Démarrer PostgreSQL et pgAdmin:

```bash
docker-compose up -d
```

3. Vérifier que les services sont démarrés:

```bash
docker-compose ps
```

## Accès

- **PostgreSQL**: `localhost:5432`

  - User: `avenir_user`
  - Password: `avenir_password`
  - Database: `avenir_db`

- **pgAdmin**: http://localhost:8080
  - Email: `avenir.noreply@gmail.com`
  - Password: `admin`

## Commandes utiles

### Voir les logs PostgreSQL

```bash
docker-compose logs -f postgres
```

### Voir les logs pgAdmin

```bash
docker-compose logs -f pgadmin
```

### Arrêter les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (ATTENTION: supprime toutes les données)

```bash
docker-compose down -v
```

### Réinitialiser la base de données

```bash
docker-compose down -v
docker-compose up -d
```

### Connexion directe à PostgreSQL

```bash
docker exec -it avenir-postgres psql -U avenir_user -d avenir_db
```

## Schema

Le script `infrastructure/database/init.sql` crée automatiquement:

- 14 tables (users, accounts, shares, orders, transactions, etc.)
- Indexes pour les performances
- Contraintes de clés étrangères
- Un utilisateur admin par défaut

## Utilisateur admin par défaut

- **Email**: `admin@avenir.com`
- **Password**: `admin123` (à changer en production!)
