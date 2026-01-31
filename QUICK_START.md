# 🚀 Quick Start - 3 Façons d'Accéder aux Notifications

## Façon 1️⃣: Via les URLs directes (Plus rapide)

### Accès direct aux pages complètes

```
Notifications: http://localhost:3000/notifications
Activités:    http://localhost:3000/activities
```

**✅ Avantages:**
- Prêt à l'emploi
- Pages complètes avec filtres
- SSE real-time inclus

**🎯 Idéal pour:** Tester rapidement, pages dédiées

---

## Façon 2️⃣: Ajouter les liens à la Navbar

### Modifier votre layout

Dans `infrastructure/next/components/organisms/Navbar.tsx`:

```tsx
import Link from "next/link"
import { Bell, Activity } from "lucide-react"

export function Navbar() {
  return (
    <nav>
      {/* ... autres liens ... */}

      {/* AJOUTER CES 2 LIGNES */}
      <Link href="/notifications">📢 Notifications</Link>
      <Link href="/activities">📊 Activités</Link>

      {/* ... */}
    </nav>
  )
}
```

**✅ Avantages:**
- Navigation intégrée
- Accessible depuis partout
- UX cohérente

**🎯 Idéal pour:** Navigation principale

---

## Façon 3️⃣: Intégrer les Composants dans vos Pages

### Example dans le Dashboard

```tsx
"use client"

import { ActivityFeed } from "@/components/molecules/ActivityFeed"
import { NotificationList } from "@/components/molecules/NotificationList"
import { useNotifications } from "@/hooks/useNotifications"

export default function Dashboard() {
  const { unreadCount } = useNotifications()

  return (
    <div>
      {/* Afficher l'alerte si notifications non-lues */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 p-4 rounded">
          Vous avez {unreadCount} notifications non-lues
        </div>
      )}

      {/* Intégrer le composant dropdown */}
      <NotificationList />

      {/* Intégrer le feed d'activités */}
      <ActivityFeed limit={5} showRecent={true} />
    </div>
  )
}
```

**✅ Avantages:**
- Composants réutilisables
- Intégration partielle
- Contrôle granulaire

**🎯 Idéal pour:** Widgets, sections spécifiques

---

## 📱 Exemples d'Intégration par Cas d'Usage

### 1. Afficher un Badge avec Compteur

```tsx
import { NotificationBell } from "@/components/atoms/NotificationBell"

// Dans votre header
<NotificationBell />

// ✨ Affiche: 🔔 avec badge rouge "3" si 3 notifications
```

### 2. Afficher une Dropdown avec Liste

```tsx
import { NotificationList } from "@/components/molecules/NotificationList"

// Dans votre header
<NotificationList />

// ✨ Clique pour voir toutes les notifications
```

### 3. Afficher le Feed d'Activités

```tsx
import { ActivityFeed } from "@/components/molecules/ActivityFeed"

// Dans votre dashboard/sidebar
<ActivityFeed limit={5} showRecent={true} />

// ✨ Affiche les 5 activités les plus récentes
```

### 4. Contrôle Complet avec Hooks

```tsx
"use client"

import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"

export default function CustomNotifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotifications()

  // Subscribe aux nouvelles notifications en temps réel
  useSSENotifications({
    onNotification: (notification) => {
      // Faire quelque chose avec la notification
      alert(`Nouvelle: ${notification.title}`)
    }
  })

  return (
    <div>
      <h2>({unreadCount}) Notifications</h2>
      {notifications.map(n => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <button onClick={() => markAsRead(n.id)}>Lue</button>
          <button onClick={() => deleteNotification(n.id)}>Suppr</button>
        </div>
      ))}
    </div>
  )
}
```

---

## ⚙️ Configuration Requise

### 1. Vérifier que les services tournent

```bash
# Terminal 1: Base de données
docker-compose up -d postgres

# Terminal 2: Express (port 3001)
npm run dev:express

# Terminal 3: Next.js (port 3000)
cd infrastructure/next && npm run dev
```

### 2. Vérifier l'authentification

Les composants nécessitent:

```typescript
// Dans localStorage
localStorage.setItem('token', 'votre-jwt-token')
localStorage.setItem('userId', 'user-1')
```

### 3. Charger les données de test (optionnel)

```bash
psql -U postgres -d avenir < \
  infrastructure/database/fixtures/001_seed_notifications_activities.sql
```

---

## 🧪 Tester en 30 Secondes

### Étape 1: Accéder à la page

```
http://localhost:3000/notifications
```

### Étape 2: Envoyer une notification avec curl

```bash
curl -X POST "http://localhost:3001/api/notifications/send" \
  -H "Authorization: Bearer test-token" \
  -H "x-user-id: user-1" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientUserId": "user-1",
    "title": "Test",
    "message": "Ça marche!",
    "type": "info"
  }'
```

### Étape 3: Observer en temps réel 

La notification apparaîtra **immédiatement** dans le navigateur! ⚡

---

## 📋 Checklist Intégration

- [ ] Services lancés (Docker, Express, Next.js)
- [ ] Accès à `http://localhost:3000/notifications` ✅
- [ ] Accès à `http://localhost:3000/activities` ✅
- [ ] Badge NotificationBell intégré dans Navbar ✅
- [ ] Dropdown NotificationList intégré dans Navbar ✅
- [ ] ActivityFeed intégré dans Dashboard ✅
- [ ] Test SSE real-time ✅
- [ ] Fixtures chargées (optionnel) ✅

---

## 🎓 Voici Votre Sélection Recommandée

### Pour les Développeurs Pressés
1. Utiliser les **URLs directes** (`/notifications`, `/activities`)
2. Ajouter les **liens dans la Navbar**
3. C'est tout! ✨

### Pour l'Intégration Complète
1. Ajouter **Navbar avec liens**
2. Intégrer **ActivityFeed dans Dashboard**
3. Intégrer **NotificationList dans Header**
4. Utiliser les **Hooks pour le contrôle personnalisé**

### Pour les Cas Spécifiques
- **Badge uniquement:** `<NotificationBell />`
- **Dropdown uniquement:** `<NotificationList />`
- **Feed uniquement:** `<ActivityFeed />`
- **Logique personnalisée:** Utiliser les `Hooks` directement

---

## 💡 Tips & Tricks

### Ajouter une Toast au-dessus de tout
```tsx
useSSENotifications({
  onNotification: (notification) => {
    toast.show({
      title: notification.title,
      message: notification.message,
      type: notification.type
    })
  }
})
```

### Jouer un son quand notification
```tsx
useSSENotifications({
  onNotification: () => {
    const audio = new Audio('/notification-sound.mp3')
    audio.play()
  }
})
```

### Mettre à jour le favicon
```tsx
useSSENotifications({
  onNotification: () => {
    document.title = '🔴 Nouvelle notification!'
  }
})
```

---

## 🆘 Problèmes?

| Problème | Solution |
|----------|----------|
| Pages blanches | Vérifier tokens dans localStorage |
| Pas de données | Charger les fixtures SQL |
| SSE ne marche pas | Vérifier port 3001 du serveur Express |
| Erreur 401 | Vérifier le JWT token |
| Erreur CORS | Configurer CORS dans Express |

---

**Vous êtes prêt! Commencez par accéder aux URLs directes.** 🚀
