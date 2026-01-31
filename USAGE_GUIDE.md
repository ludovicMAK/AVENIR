# 📖 Guide d'Utilisation du Système de Notifications

## 🎯 Accès Rapide

### URLs directes
- **Notifications:** `http://localhost:3000/notifications`
- **Activités:** `http://localhost:3000/activities`

Ces pages sont **déjà créées** et fonctionnelles! ✅

---

## 🔗 Ajouter les Liens à la Navigation

### Option 1: Ajouter dans l'Header/Navbar

**Fichier:** `infrastructure/next/components/molecules/Header.tsx` (ou votre navbar)

```tsx
"use client"

import Link from "next/link"
import { NotificationBell } from "@/components/atoms/NotificationBell"
import { NotificationList } from "@/components/molecules/NotificationList"

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          AVENIR
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/accounts" className="hover:text-blue-600">
            Comptes
          </Link>

          {/* Nouvelles sections - Notifications & Activités */}
          <Link href="/notifications" className="hover:text-blue-600">
            Notifications
          </Link>
          <Link href="/activities" className="hover:text-blue-600">
            Activités
          </Link>

          {/* Ou utiliser les composants directement */}
          <NotificationList />
        </nav>
      </div>
    </header>
  )
}
```

### Option 2: Ajouter au Sidebar/Menu

```tsx
"use client"

import Link from "next/link"
import { Bell, Activity } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <nav className="space-y-4">
        <Link href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded">
          <span>📊 Dashboard</span>
        </Link>

        <Link href="/accounts" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded">
          <span>💳 Comptes</span>
        </Link>

        {/* NOUVEAU: Notifications et Activités */}
        <Link href="/notifications" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </Link>

        <Link href="/activities" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded">
          <Activity className="w-5 h-5" />
          <span>Activités</span>
        </Link>
      </nav>
    </aside>
  )
}
```

---

## 📱 Utiliser les Composants dans Vos Pages

### 1. Intégrer le Badge dans le Header

```tsx
import { NotificationBell } from "@/components/atoms/NotificationBell"

export function Header() {
  return (
    <header>
      {/* ... autres éléments ... */}
      <NotificationBell />
    </header>
  )
}
```

**Résultat:** Un badge rouge avec le nombre de notifications non-lues s'affichera!

### 2. Intégrer la Liste Dropdown dans le Header

```tsx
import { NotificationList } from "@/components/molecules/NotificationList"

export function Header() {
  return (
    <header>
      {/* ... autres éléments ... */}
      <NotificationList />
    </header>
  )
}
```

**Résultat:** Un bouton cliquable qui ouvre un dropdown avec la liste des notifications!

### 3. Intégrer le Feed dans une Page

```tsx
"use client"

import { ActivityFeed } from "@/components/molecules/ActivityFeed"

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        {/* Vos autres contenus */}
      </div>

      <div>
        {/* Afficher les 5 activités récentes */}
        <ActivityFeed limit={5} showRecent={true} />
      </div>
    </div>
  )
}
```

---

## 🎨 Exemple Complet: Dashboard avec Notifications

```tsx
"use client"

import { useState } from "react"
import { NotificationBell } from "@/components/atoms/NotificationBell"
import { NotificationList } from "@/components/molecules/NotificationList"
import { ActivityFeed } from "@/components/molecules/ActivityFeed"
import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"

export default function DashboardPage() {
  const { unreadCount } = useNotifications()

  // Subscribe aux notifications en temps réel
  useSSENotifications({
    onNotification: (notification) => {
      // Afficher une toast notification
      console.log("Nouvelle notification:", notification.title)
    },
    onError: (error) => {
      console.error("Erreur SSE:", error)
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <NotificationList />
            <button className="px-4 py-2 bg-red-600 text-white rounded">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Colonne gauche: Infos comptes */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Bienvenue!</h2>
              <p>Vos comptes et informations bancaires...</p>
            </div>
          </div>

          {/* Colonne droite: Activités */}
          <div>
            <ActivityFeed limit={5} showRecent={true} />
          </div>
        </div>
      </main>
    </div>
  )
}
```

---

## 🚀 Étapes pour Tester en Local

### 1️⃣ Démarrer les services

```bash
# Terminal 1: Base de données
docker-compose up -d postgres

# Terminal 2: Serveur Express
npm run dev:express

# Terminal 3: Frontend Next.js
cd infrastructure/next
npm run dev
```

### 2️⃣ Charger les données de test

```bash
psql -U postgres -d avenir < infrastructure/database/fixtures/001_seed_notifications_activities.sql
```

### 3️⃣ Accéder à l'application

Ouvrir dans votre navigateur:
- Frontend: `http://localhost:3000`
- Pages:
  - Notifications: `http://localhost:3000/notifications`
  - Activités: `http://localhost:3000/activities`

### 4️⃣ Tester le real-time (SSE)

**Avec curl dans un terminal séparé:**

```bash
# Ouvrir une subscription SSE
curl -N "http://localhost:3001/api/notifications/subscribe" \
  -H "Authorization: Bearer your-token" \
  -H "x-user-id: user-1"

# Dans un autre terminal, envoyer une notification
curl -X POST "http://localhost:3001/api/notifications/send" \
  -H "Authorization: Bearer your-token" \
  -H "x-user-id: user-1" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientUserId": "user-1",
    "title": "Test",
    "message": "Ceci est un test",
    "type": "info"
  }'
```

**La notification apparaîtra automatiquement en temps réel!** ⚡

---

## 🔌 Utiliser les Hooks dans Vos Composants

### useNotifications - Contrôle complet

```tsx
"use client"

import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"

export default function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    addNotification,
  } = useNotifications()

  // Subscribe aux nouvelles notifications en temps réel
  useSSENotifications({
    onNotification: (notification) => {
      addNotification(notification)
      // Afficher une toast, jouer un son, etc.
    },
  })

  return (
    <div>
      <h1>Vous avez {unreadCount} notifications non-lues</h1>

      {notifications.map((notif) => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>
            Marquer comme lue
          </button>
          <button onClick={() => deleteNotification(notif.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  )
}
```

### useActivities - Filtrer les activités

```tsx
"use client"

import { useActivities } from "@/hooks/useActivities"
import { useSSEActivities } from "@/hooks/useSSEActivities"

export default function MyComponent() {
  const {
    activities,
    isLoading,
    fetchRecentActivities,
    addActivity,
  } = useActivities()

  // Subscribe aux nouvelles activités
  useSSEActivities({
    onActivity: (activity) => {
      addActivity(activity)
    },
  })

  return (
    <div>
      <h1>{activities.length} activités</h1>
      <button onClick={() => fetchRecentActivities(10)}>
        Charger plus
      </button>

      {activities.map((activity) => (
        <div key={activity.id}>
          <h3>{activity.description}</h3>
          <p>Priorité: {activity.priority}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🎛️ Paramétrer les Composants

### NotificationBell avec options

```tsx
<NotificationBell />
// Options - show unread count badge
// Clique pour ouvrir la liste complète
```

### NotificationList avec filtres

```tsx
<NotificationList />
// Affiche dropdown avec:
// - Compteur non-lus
// - Badge par type (info, warning, error, news)
// - Bouton Marquer comme lu
// - Bouton Supprimer
// - Affichage de l'auteur et du timestamp
```

### ActivityFeed avec paramètres

```tsx
<ActivityFeed 
  limit={5}          // Nombre d'activités à afficher
  showRecent={true}  // Afficher les plus récentes
/>
// Options filtre par priorité
// Affiche metadonnées
```

---

## 🔐 Authentification

Les composants nécessitent que vous soyez **authentifié**. 

Assurez-vous d'avoir:

1. **Un token JWT valide** en localStorage/cookie:
```typescript
localStorage.setItem('token', 'votre-jwt-token')
```

2. **L'ID utilisateur** disponible:
```typescript
localStorage.setItem('userId', 'user-1')
```

Les hooks utiliseront automatiquement ces valeurs via `useCurrentUser()`.

---

## ✨ Points Clés

| Feature | URL | Composant | Hook |
|---------|-----|-----------|------|
| Page Notifications | `/notifications` | `NotificationList` | `useNotifications` |
| Page Activités | `/activities` | `ActivityFeed` | `useActivities` |
| Badge | Intégrer partout | `NotificationBell` | - |
| Real-time Notif | Auto | - | `useSSENotifications` |
| Real-time Activity | Auto | - | `useSSEActivities` |

---

## 🧪 Checklist de Test

- [ ] Accéder à `/notifications` depuis le navigateur
- [ ] Accéder à `/activities` depuis le navigateur
- [ ] Cliquer sur le NotificationList pour voir le dropdown
- [ ] Marquer une notification comme lue
- [ ] Filtrer les notifications par type
- [ ] Filtrer les activités par priorité
- [ ] Envoyer une notification avec curl → Vérifier SSE en temps réel
- [ ] Vérifier que le badge se met à jour en temps réel

---

## 📞 Besoin d'aide?

Consultez:
- `INTEGRATION_GUIDE.md` - Guide technique complet
- `infrastructure/next/components/` - Code des composants
- `infrastructure/next/hooks/` - Code des hooks
- `infrastructure/next/app/notifications/page.tsx` - Exemple de page complète
- `infrastructure/next/app/activities/page.tsx` - Autre exemple de page
