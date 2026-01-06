# 📮 Postman - AVENIR Banking API

## 📥 Import dans Postman

### 1. **Importer la Collection**

1. Ouvrir Postman
2. Cliquer sur **Import** (bouton en haut à gauche)
3. Sélectionner le fichier `AVENIR_Collection.postman_collection.json`
4. Cliquer sur **Import**

### 2. **Importer l'Environnement**

1. Cliquer sur **Import**
2. Sélectionner le fichier `AVENIR_Environment.postman_environment.json`
3. Cliquer sur **Import**
4. **Activer** l'environnement "AVENIR - Local" (menu déroulant en haut à droite)

---

## 🚀 Démarrage Rapide

### **Prérequis**

Assurez-vous que votre serveur backend est démarré :

```bash
cd infrastructure/express
npm run dev
```

Le serveur devrait être accessible sur `http://localhost:3000`

---

## 📋 Workflow de Test

### **Scénario 1 : Inscription et Création de Compte**

Exécutez les requêtes dans cet ordre :

1. **Register User (Customer)** → Inscrit un client
   - Les variables `customerId` et `userId` sont automatiquement sauvegardées
2. **Confirm Registration** → Confirme l'inscription
   - ⚠️ Récupérez le token dans la console ou l'email
   - Mettez-le dans la variable `confirmToken`
3. **Login** → Se connecter
   - Le token d'authentification est sauvegardé automatiquement
4. **Create Account (Current)** → Créer un compte courant
   - Les variables `accountId` et `iban` sont sauvegardées
5. **Get User Accounts** → Vérifier les comptes créés

---

### **Scénario 2 : Trading d'Actions**

1. **Register User (Director)** → Créer un directeur
2. **Login** → Se connecter en tant que directeur
3. **Create Share - Apple** → Créer l'action Apple
   - La variable `shareId` est sauvegardée
4. **Create Share - Microsoft** → Créer l'action Microsoft
5. **Get All Shares** → Liste de toutes les actions
6. **Register User (Customer)** → Créer un client (si pas déjà fait)
7. **Place Order (Buy)** → Passer un ordre d'achat
   - La variable `orderId` est sauvegardée
8. **Get Customer Orders** → Voir les ordres du client
9. **Get Customer Positions** → Voir les positions du client
10. **Cancel Order** → Annuler un ordre

---

### **Scénario 3 : Messagerie Conseiller-Client**

1. **Register User (Customer)** → Créer un client
2. **Register User (Advisor)** → Créer un conseiller
   - La variable `advisorId` est sauvegardée
3. **Create Conversation** → Créer une conversation
   - La variable `conversationId` est sauvegardée
4. **Send Message (Customer)** → Le client envoie un message
5. **Send Message (Advisor)** → Le conseiller répond
6. **Get Conversation Messages** → Voir tous les messages
7. **Get Customer Conversations** → Conversations du client
8. **Get Advisor Conversations** → Conversations du conseiller
9. **Close Conversation** → Fermer la conversation

---

## 🔧 Variables d'Environnement

Les variables suivantes sont automatiquement remplies lors des tests :

| Variable           | Description                  | Auto-remplie |
| ------------------ | ---------------------------- | ------------ |
| `baseUrl`          | URL de base de l'API         | ✅           |
| `userId`           | ID de l'utilisateur connecté | ✅           |
| `customerId`       | ID du client                 | ✅           |
| `advisorId`        | ID du conseiller             | ✅           |
| `directorId`       | ID du directeur              | ✅           |
| `accountId`        | ID du compte courant         | ✅           |
| `savingsAccountId` | ID du compte épargne         | ✅           |
| `iban`             | IBAN du compte               | ✅           |
| `shareId`          | ID de l'action               | ✅           |
| `orderId`          | ID de l'ordre                | ✅           |
| `conversationId`   | ID de la conversation        | ✅           |
| `authToken`        | Token d'authentification     | ✅           |
| `confirmToken`     | Token de confirmation email  | ❌ Manuel    |
| `transferId`       | ID du transfert              | ❌ Manuel    |

---

## ⚙️ Tests Automatiques

Chaque requête inclut des tests automatiques :

### **Tests Globaux** (Collection)

- ✅ Temps de réponse < 3000ms
- ✅ Content-Type = application/json

### **Tests Spécifiques** (Par requête)

- ✅ Code de statut correct (200, 201)
- ✅ Auto-sauvegarde des IDs dans les variables d'environnement
- ✅ Validation des données retournées

---

## 📊 Exemples de Données

### **Utilisateurs**

```json
// Customer
{
  "email": "jean.dupont@avenir.com",
  "password": "SecurePassword123!",
  "role": "customer"
}

// Advisor
{
  "email": "sophie.martin@avenir.com",
  "password": "AdvisorPass123!",
  "role": "advisor"
}

// Director
{
  "email": "pierre.leblanc@avenir.com",
  "password": "DirectorPass123!",
  "role": "director"
}
```

### **Comptes**

```json
// Compte Courant
{
  "accountType": "current",
  "authorizedOverdraft": true,
  "overdraftLimit": 50000  // 500€ en centimes
}

// Compte Épargne
{
  "accountType": "savings",
  "authorizedOverdraft": false,
  "overdraftLimit": 0
}
```

### **Actions**

```json
// Apple
{
  "symbol": "AAPL",
  "initialPrice": 15000  // 150€ en centimes
}

// Microsoft
{
  "symbol": "MSFT",
  "initialPrice": 37500  // 375€ en centimes
}
```

---

## 💡 Conseils

### **Modifier le Port**

Si votre serveur utilise un autre port :

1. Allez dans l'environnement "AVENIR - Local"
2. Modifiez la variable `baseUrl`
3. Par exemple : `http://localhost:4000`

### **Debugger une Requête**

1. Ouvrez la console Postman (View → Show Postman Console)
2. Exécutez votre requête
3. Vérifiez les logs détaillés

### **Réinitialiser les Variables**

Si vous voulez recommencer les tests :

1. Allez dans l'environnement
2. Videz toutes les valeurs (sauf `baseUrl`)
3. Sauvegardez

### **Exporter les Résultats**

Pour partager vos tests :

1. Collection → ⋯ → Export
2. Choisissez Collection v2.1
3. Partagez le fichier JSON

---

## 🐛 Dépannage

### **Erreur : Could not get any response**

- ✅ Vérifiez que le serveur backend est démarré
- ✅ Vérifiez le port dans `baseUrl`
- ✅ Vérifiez qu'il n'y a pas de firewall qui bloque

### **Erreur 404 : Not Found**

- ✅ Vérifiez l'URL de la requête
- ✅ Vérifiez que la route existe dans votre API

### **Variables vides**

- ✅ Vérifiez que vous avez activé l'environnement "AVENIR - Local"
- ✅ Exécutez d'abord les requêtes qui créent les ressources
- ✅ Vérifiez les scripts de test dans chaque requête

### **Erreur : Invalid JSON**

- ✅ Vérifiez la syntaxe JSON dans le body
- ✅ Assurez-vous que toutes les accolades sont fermées
- ✅ Utilisez un validateur JSON en ligne

---

## 📚 Ressources

- **Documentation Postman** : https://learning.postman.com/
- **Variables Postman** : https://learning.postman.com/docs/sending-requests/variables/
- **Tests Postman** : https://learning.postman.com/docs/writing-scripts/test-scripts/

---

## 🎯 Checklist de Test Complète

- [ ] Créer un utilisateur Customer
- [ ] Confirmer l'inscription
- [ ] Se connecter
- [ ] Créer un compte courant
- [ ] Créer un compte épargne
- [ ] Récupérer les comptes
- [ ] Renommer un compte
- [ ] Créer un utilisateur Director
- [ ] Créer des actions (Apple, Microsoft)
- [ ] Créer un utilisateur Advisor
- [ ] Placer un ordre d'achat
- [ ] Placer un ordre de vente
- [ ] Voir les positions
- [ ] Créer une conversation
- [ ] Envoyer des messages
- [ ] Transférer une conversation
- [ ] Fermer une conversation
- [ ] Créer une transaction
- [ ] Valider un transfert

---

**Bon test ! 🚀**
