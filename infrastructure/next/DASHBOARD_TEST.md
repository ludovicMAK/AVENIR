# Test du Dashboard

## 📋 Prérequis

1. **Backend Express en cours d'exécution**

   ```bash
   # Terminal 1 - Depuis la racine du projet
   docker compose up
   ```

2. **Frontend Next.js en cours d'exécution**
   ```bash
   # Terminal 2 - Depuis infrastructure/next
   npm run dev
   ```

## 🧪 Étapes de test

### 1. Créer un compte utilisateur (si pas déjà fait)

```bash
# Ouvrir http://localhost:3000/register
```

**Remplir le formulaire:**

- Nom d'utilisateur: `testuser`
- Email: `test@example.com`
- Prénom: `Test`
- Nom: `User`
- Mot de passe: `Password123!`

**Confirmer l'email:**

```bash
# Ouvrir http://localhost:3000/confirm-registration?token=<TOKEN>
# Le token sera affiché dans les logs du backend ou visible en DB
```

### 2. Se connecter

```bash
# Ouvrir http://localhost:3000/login
```

**Identifiants:**

- Email: `test@example.com`
- Mot de passe: `Password123!`

### 3. Accéder au Dashboard

```bash
# Ouvrir http://localhost:3000/dashboard
```

**Ce que vous devriez voir:**

- ✅ Header avec "Tableau de bord" et bouton "Nouveau compte"
- ✅ 3 cartes de statistiques (Solde total, Comptes courants, Épargne)
- ✅ Section "Vos comptes" (vide si aucun compte)
- ✅ Section "Activité récente" (placeholder pour l'instant)

### 4. Créer un compte (via API)

**Option A: Via Postman/cURL**

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<VOTRE_TOKEN>" \
  -d '{
    "idOwner": "<USER_ID>",
    "accountType": "current",
    "accountName": "Mon compte courant",
    "authorizedOverdraft": true,
    "overdraftLimit": 500,
    "overdraftFees": 7
  }'
```

**Option B: Via la base de données directement**

```sql
-- Connectez-vous à PostgreSQL
docker exec -it avenir-db psql -U postgres -d avenir

-- Insérer un compte de test
INSERT INTO accounts (
  id,
  account_name,
  balance,
  id_owner,
  account_type,
  status,
  iban,
  authorized_overdraft,
  overdraft_limit,
  overdraft_fees
) VALUES (
  gen_random_uuid(),
  'Mon compte courant',
  1500.50,
  '<USER_ID>',
  'current',
  'open',
  'FR7612345678901234567890123',
  true,
  500,
  7
);
```

### 5. Rafraîchir le Dashboard

```bash
# Recharger http://localhost:3000/dashboard
```

**Vous devriez maintenant voir:**

- ✅ Solde total mis à jour (1500,50 €)
- ✅ Carte du compte avec:
  - Nom du compte
  - Badge "Compte courant"
  - IBAN formaté (FR76 1234 5678 9012 3456 7890 123)
  - Solde actuel (1 500,50 €)
  - Disponible avec découvert (2 000,50 €)
- ✅ Clic sur la carte devrait rediriger vers `/accounts/<ID>` (page à créer)

### 6. Tester un compte en découvert

```sql
-- Mettre le compte en découvert
UPDATE accounts
SET balance = -250
WHERE account_name = 'Mon compte courant';
```

**Rafraîchir le dashboard:**

- ✅ Solde en rouge (-250,00 €)
- ✅ Bannière d'avertissement "⚠️ Compte en découvert"
- ✅ Limite de découvert affichée

### 7. Créer plusieurs comptes

```sql
-- Compte épargne
INSERT INTO accounts (id, account_name, balance, id_owner, account_type, status, iban)
VALUES (gen_random_uuid(), 'Livret A', 5000, '<USER_ID>', 'savings', 'open', 'FR7687654321098765432109876');

-- Compte titres
INSERT INTO accounts (id, account_name, balance, id_owner, account_type, status, iban)
VALUES (gen_random_uuid(), 'PEA', 12000, '<USER_ID>', 'trading', 'open', 'FR7611111111111111111111111');
```

**Dashboard attendu:**

- ✅ Solde total: 16 750,00 € (ou calculé selon vos données)
- ✅ 3 comptes affichés avec badges de couleurs différentes
- ✅ Statistiques par type de compte mises à jour

## 🐛 Debugging

### Le dashboard ne s'affiche pas

```bash
# Vérifier la console navigateur (F12)
# Vérifier les logs Next.js
# Vérifier que le backend Express répond sur http://localhost:3001
```

### "Impossible de charger vos comptes"

```bash
# Vérifier que l'API route /api/accounts fonctionne
curl http://localhost:3000/api/accounts?ownerId=<USER_ID>

# Vérifier les logs du backend Express
docker compose logs backend
```

### Redirection vers /login

```bash
# Le cookie auth_token n'est pas présent
# Se reconnecter via /login
```

## 📊 Résultat attendu

Le dashboard doit afficher:

1. **En-tête** avec titre et bouton "Nouveau compte"
2. **3 cartes statistiques** avec icônes et valeurs formatées
3. **Liste des comptes** avec:
   - Nom et type (badge coloré)
   - IBAN formaté
   - Solde principal
   - Solde disponible (si découvert autorisé)
   - Alerte visuelle si découvert
4. **Section activité** (placeholder)
5. **Design responsive** (mobile/desktop)
6. **État de chargement** (skeleton)
7. **Gestion d'erreur** avec bouton "Réessayer"

## 🎨 Composants utilisés

- ✅ Card, CardHeader, CardTitle, CardContent (shadcn)
- ✅ Badge avec couleurs personnalisées
- ✅ Button avec icônes Lucide
- ✅ Skeleton pour loading states
- ✅ Layout responsive avec Tailwind grid
- ✅ Formatage via lib/accounts/utils.ts
- ✅ Hooks via hooks/useAccounts.ts

## 🔜 Prochaines étapes suggérées

1. Page de création de compte (`/accounts/new`)
2. Page de détails d'un compte (`/accounts/[id]`)
3. Page de transactions (`/accounts/[id]/transactions`)
4. Afficher les vraies transactions récentes dans le dashboard
