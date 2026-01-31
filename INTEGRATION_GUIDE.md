# Système de Notifications - Guide d'Intégration et Tests

## 📋 Vue d'ensemble

Ce document explique comment tester et utiliser le système complet de notifications avec SSE en temps réel.

## 🚀 Démarrage

### 1. Lancer la base de données
```bash
docker-compose up -d postgres
```

### 2. Exécuter les migrations
```bash
npm run migrate
```

### 3. Charger les fixtures de test (optionnel)
```bash
psql -U postgres -d avenir < infrastructure/database/fixtures/001_seed_notifications_activities.sql
```

### 4. Lancer le serveur Express
```bash
npm run dev:express
```

Le serveur Express démarre sur `http://localhost:3001`

### 5. Lancer le frontend Next.js
```bash
cd infrastructure/next
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## 📡 Endpoints API

### Notifications

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/notifications` | Récupérer toutes les notifications | Obligatoire |
| GET | `/api/notifications/count` | Récupérer le compte non-lu | Obligatoire |
| POST | `/api/notifications/send` | Envoyer une notification | Obligatoire (Advisor/Manager) |
| POST | `/api/notifications/:id/read` | Marquer comme lue | Obligatoire |
| DELETE | `/api/notifications/:id` | Supprimer une notification | Obligatoire |
| GET | `/api/notifications/subscribe` | SSE subscription | Obligatoire |

### Activités

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/activities` | Récupérer les activités | Obligatoire |
| GET | `/api/activities/:id` | Récupérer une activité | Obligatoire |
| GET | `/api/activities/recent` | Récupérer les activités récentes | Obligatoire |
| GET | `/api/activities/subscribe` | SSE subscription | Obligatoire |

## 🧪 Tester les Endpoints

### Avec curl

```bash
# Récupérer les notifications
curl -X GET "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: user-1"

# Marquer comme lue
curl -X POST "http://localhost:3001/api/notifications/notif-2/read" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: user-1" \
  -H "Content-Type: application/json" \
  -d '{}'

# SSE subscription
curl -N "http://localhost:3001/api/notifications/subscribe" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: user-1"
```

### Avec Postman

1. Créer une collection pour les endpoints
2. Ajouter le header `Authorization: Bearer YOUR_TOKEN`
3. Ajouter le header `x-user-id: user-1`
4. Tester les GET/POST/DELETE normalement
5. Pour les SSE, utiliser l'onglet "WebSocket" ou "Server-sent events"

### Script de test automatisé

```bash
chmod +x tests/api_tests.sh
tests/api_tests.sh
```

## 🎨 Pages Frontend

### Page Notifications
**URL:** `http://localhost:3000/notifications`

Fonctionnalités:
- Affiche toutes les notifications
- Filtrer par type (info, warning, error, news)
- Filtrer par statut (lues, non-lues)
- Marquer comme lue/supprimer
- Compteur de notifications non-lues
- Subscription SSE pour les nouvelles notifications en temps réel

### Page Activités
**URL:** `http://localhost:3000/activities`

Fonctionnalités:
- Affiche toutes les activités
- Filtrer par priorité (basse, moyenne, haute)
- Affichage du nom et prénom de l'auteur
- Métadonnées pour chaque activité
- Subscription SSE pour les nouvelles activités en temps réel

## 🔌 Composants React

### NotificationBell
Badge affichant le nombre de notifications non-lues

```tsx
import { NotificationBell } from "@/components/atoms/NotificationBell"

export default function Header() {
  return <NotificationBell />
}
```

### NotificationList
Dropdown avec la liste complète des notifications

```tsx
import { NotificationList } from "@/components/molecules/NotificationList"

export default function Header() {
  return <NotificationList />
}
```

### ActivityFeed
Feed des activités récentes avec filtres

```tsx
import { ActivityFeed } from "@/components/molecules/ActivityFeed"

export default function Dashboard() {
  return <ActivityFeed limit={10} showRecent={true} />
}
```

## 🪝 Hooks React

### useNotifications
```tsx
const { 
  notifications,        // NotificationWithUser[]
  unreadCount,         // number
  isLoading,           // boolean
  error,               // ApiError | null
  refresh,             // () => Promise<void>
  markAsRead,          // (id: string) => Promise<void>
  deleteNotification,  // (id: string) => Promise<void>
  addNotification,     // (n: NotificationWithUser) => void
  fetchUnreadCount     // () => Promise<void>
} = useNotifications()
```

### useSSENotifications
```tsx
useSSENotifications({
  onNotification: (notification) => {
    console.log("Nouvelle notification:", notification)
  },
  onError: (error) => {
    console.error("Erreur SSE:", error)
  }
})
```

### useActivities
```tsx
const {
  activities,           // ActivityFeed[]
  isLoading,           // boolean
  error,               // ApiError | null
  refresh,             // () => Promise<void>
  fetchActivities,     // () => Promise<void>
  fetchRecentActivities, // (limit?) => Promise<void>
  addActivity          // (a: ActivityFeed) => void
} = useActivities()
```

### useSSEActivities
```tsx
useSSEActivities({
  onActivity: (activity) => {
    console.log("Nouvelle activité:", activity)
  },
  onError: (error) => {
    console.error("Erreur SSE:", error)
  }
})
```

## 🔐 Authentification

### Headers requis

Tous les endpoints requièrent:
- `Authorization: Bearer <token>` - JWT token valide
- `x-user-id: <userId>` - ID de l'utilisateur actuel

### Exemple avec fetch

```typescript
const response = await fetch("/api/notifications", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "x-user-id": userId,
    "Content-Type": "application/json"
  }
})
```

## 📊 Données de test

Les fixtures incluent:

**Notifications:**
- 3 non-lues (warning, error, news)
- 4 lues (info, warning, news x2)
- Variée: de 15 min à 2 jours

**Activités:**
- 9 activités de test
- Priorités variées: haute, moyenne, basse
- Types divers: transaction, account_update, login, etc.

## 🐛 Dépannage

### SSE ne fonctionne pas
1. Vérifier que le serveur Express est actif
2. Vérifier les headers d'authentification
3. Vérifier la console du navigateur pour les erreurs CORS
4. Vérifier les logs du serveur

### Erreur 401 Unauthorized
- Vérifier le token JWT
- Vérifier le header `x-user-id`

### Erreur 403 Forbidden
- L'utilisateur n'a pas les permissions pour cette action
- Pour envoyer une notification, le rôle doit être `bankAdvisor` ou `bankManager`

### Erreur 404 Not Found
- Vérifier que l'ID de la notification/activité existe
- Vérifier l'endpoint URL

## 📝 Notes importantes

1. **SSE vs WebSocket**: Le système utilise SSE (Server-Sent Events), pas WebSocket
2. **Real-time**: Les notifications et activités arrivent en temps réel grâce aux SSE
3. **Broadcast**: Quand une notification est envoyée, elle est immédiatement broadcastée à tous les clients SSE
4. **Persistance**: Les notifications et activités sont persistées en base de données
5. **Authentification**: Chaque utilisateur ne reçoit que ses propres notifications

## 🚢 Production

Pour la production:
1. Utiliser des variables d'environnement pour les tokens
2. Configurer CORS correctement
3. Ajouter des logs robustes
4. Implémenter la retry logic pour les SSE
5. Ajouter des métriques et monitoring
6. Tester la charge avec de nombreuses connexions SSE simultanées

## 📚 Ressources supplémentaires

- [Clean Architecture in Node.js](https://github.com/jmfiola/node-clean-architecture)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Express.js Guide](https://expressjs.com/)
