# 🏗️ Architecture du Système de Notifications

## 📊 Vue d'Ensemble Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (Frontend)                        │
│                   http://localhost:3000                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Pages & Components                 │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  /notifications          /activities          Navbar    │    │
│  │  ┌─────────────┐        ┌────────────┐       ┌─────┐   │    │
│  │  │ Page Notif  │        │ Page Acti  │       │Links│   │    │
│  │  │ - Filtres   │        │ - Filtres  │       │- N  │   │    │
│  │  │ - Liste     │        │ - Affichage│       │- A  │   │    │
│  │  │ - Actions   │        │ - SSE      │       └─────┘   │    │
│  │  └─────────────┘        └────────────┘                 │    │
│  │         ▲                      ▲                        │    │
│  │         │                      │                        │    │
│  │  Hooks & Components:                                   │    │
│  │  - useNotifications          - ActivityFeed           │    │
│  │  - useSSENotifications       - NotificationList       │    │
│  │  - useActivities             - NotificationBell       │    │
│  │  - useSSEActivities                                    │    │
│  │         │                      │                        │    │
│  │         └──────────────────────┴────────────┐          │    │
│  │                                             ▼          │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │      API Client (notifications.ts)              │ │    │
│  │  │  - fetch GET/POST/DELETE                        │ │    │
│  │  │  - EventSource (SSE)                            │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  │                       │                                │    │
│  │                       ▼ HTTP + WebSocket(SSE)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         │ PORT 3001                              │
│                         ▼                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│           Express.js Server (Backend)                            │
│           http://localhost:3001/api                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         HTTP Handlers & Routes                         │    │
│  │  ┌──────────────────┐      ┌──────────────────┐       │    │
│  │  │ NotificationHttp │      │ ActivityHttp     │       │    │
│  │  │ Handler          │      │ Handler          │       │    │
│  │  ├──────────────────┤      ├──────────────────┤       │    │
│  │  │ GET /            │      │ GET /            │       │    │
│  │  │ POST /send       │      │ GET /recent      │       │    │
│  │  │ POST /:id/read   │      │ GET /subscribe   │       │    │
│  │  │ DELETE /:id      │      │                  │       │    │
│  │  │ GET /subscribe   │      │                  │       │    │
│  │  │ GET /count       │      │                  │       │    │
│  │  └──────────────────┘      └──────────────────┘       │    │
│  │           ▲                          ▲                 │    │
│  │           │                          │                 │    │
│  │  Controllers & Use Cases:                              │    │
│  │  ├─ NotificationController                             │    │
│  │  │  ├─ sendNotification                               │    │
│  │  │  ├─ getNotifications                               │    │
│  │  │  ├─ markAsRead                                     │    │
│  │  │  ├─ getUnreadCount                                 │    │
│  │  │  └─ delete                                         │    │
│  │  │                                                     │    │
│  │  └─ ActivityController                                │    │
│  │     ├─ getAll                                         │    │
│  │     ├─ getById                                        │    │
│  │     ├─ getRecent                                      │    │
│  │     └─ subscribe                                      │    │
│  │           │                          │                 │    │
│  │           └──────────────────────────┴────────────┐   │    │
│  │                                                   ▼   │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │      SSE Manager & Services                     │ │    │
│  │  │  - SSEManager (Singleton)                       │ │    │
│  │  │  - SSEService (addClient, broadcast)           │ │    │
│  │  │  - Real-time Push                              │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  │                       │                                │    │
│  │  Use Cases Layer:     │                                │    │
│  │  ├─ SendNotificationToClient                          │    │
│  │  ├─ GetNotificationsForClient                         │    │
│  │  ├─ MarkNotificationAsRead                            │    │
│  │  ├─ GetUnreadNotificationCount                        │    │
│  │  ├─ DeleteNotification                                │    │
│  │  ├─ CreateActivity                                    │    │
│  │  ├─ GetActivities                                     │    │
│  │  ├─ GetActivityById                                   │    │
│  │  ├─ UpdateActivity                                    │    │
│  │  ├─ DeleteActivity                                    │    │
│  │  └─ GetRecentActivities                               │    │
│  │                       │                                │    │
│  └───────────────────────┼────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SQL Repositories Layer                      │  │
│  │  ┌────────────────────┐    ┌────────────────────┐       │  │
│  │  │ PostgresNotif      │    │ PostgresActivity   │       │  │
│  │  │ Repository         │    │ Repository         │       │  │
│  │  │                    │    │                    │       │  │
│  │  │ - findBy(Id)       │    │ - findById         │       │  │
│  │  │ - findAllByUser    │    │ - findByUser       │       │  │
│  │  │ - create           │    │ - findRecent       │       │  │
│  │  │ - update           │    │ - create           │       │  │
│  │  │ - delete           │    │ - update           │       │  │
│  │  │ - countUnread      │    │ - delete           │       │  │
│  │  └────────────────────┘    └────────────────────┘       │  │
│  │                    │                │                   │  │
│  │                    └────────────────┬─────────────────┐  │  │
│  └───────────────────────────────────┼────────────────────┘  │
│                                      │                        │
│                                      ▼                        │
└─────────────────────────────────────────────────────────────────┘
                                      │ PORT 5432
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                                │
│              Port 5432                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │ notifications TABLE  │      │ activities TABLE     │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │ id                   │      │ id                   │        │
│  │ recipientUserId      │      │ userId               │        │
│  │ senderId             │      │ type                 │        │
│  │ title                │      │ description          │        │
│  │ message              │      │ priority (high, ...  │        │
│  │ type (info, ...)     │      │ metadata (JSON)      │        │
│  │ status (read, ...)   │      │ createdAt            │        │
│  │ createdAt            │      │ updatedAt            │        │
│  │ updatedAt            │      │ INDEXES:             │        │
│  │                      │      │   - userId           │        │
│  │ INDEXES:             │      │   - priority         │        │
│  │   - recipientUserId  │      │   - createdAt        │        │
│  │   - senderId         │      │                      │        │
│  │   - status           │      │                      │        │
│  │   - type             │      │                      │        │
│  │   - createdAt        │      │                      │        │
│  └──────────────────────┘      └──────────────────────┘        │
│                                                                   │
│  Seed Data (Fixtures):                                          │
│  - 7 notifications (variées)                                    │
│  - 9 activités (variées)                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données

### 1. Récupérer les Notifications

```
User Click "Notifications"
    │
    ▼
GET /api/notifications (React)
    │
    ▼
NotificationHttpHandler.getNotifications()
    │
    ▼
NotificationController.getNotifications()
    │
    ▼
GetNotificationsForClient (UseCase)
    │
    ▼
PostgresNotificationRepository.findAllByRecipient()
    │
    ▼
Database Query (SELECT * FROM notifications...)
    │
    ▼
[Notification[], Notification[], ...]
    │
    ▼
React State ─▶ UI Update
```

### 2. Recevoir une Notification en Temps Réel (SSE)

```
Administrator sends notification
    │
    ▼
POST /api/notifications/send
    │
    ▼
NotificationHttpHandler.sendNotification()
    │
    ▼
SendNotificationToClient (UseCase)
    │
    ▼
PostgresNotificationRepository.save()
    │ (Save to DB)
    ▼
SSEManager.broadcast("notifications", notification)
    │
    ▼ (Server-Sent Event)
Browser 1 ◀─ Notification
Browser 2 ◀─ Notification
Browser 3 ◀─ Notification
    │
    ▼
useSSENotifications Hook receives it
    │
    ▼
UI Update Instantly
```

### 3. Marquer comme Lue

```
User Click "Mark as Read"
    │
    ▼
POST /api/notifications/:id/read
    │
    ▼
NotificationHttpHandler.markAsRead()
    │
    ▼
MarkNotificationAsRead (UseCase)
    │
    ▼
PostgresNotificationRepository.update()
    │ (UPDATE notifications SET status='read'...)
    ▼
Activity created (optionnel)
    │
    ▼
React State Updates
    │
    ▼
UI Reflects Change (unreadCount -1)
```

---

## 📦 Structure des Dossiers

```
infrastructure/
├── next/                      # Frontend Next.js
│   ├── app/
│   │   ├── notifications/
│   │   │   └── page.tsx       # Page complète notifications
│   │   └── activities/
│   │       └── page.tsx       # Page complète activités
│   │
│   ├── api/
│   │   └── notifications.ts   # Client API + SSE
│   │
│   ├── hooks/
│   │   ├── useNotifications.ts
│   │   ├── useActivities.ts
│   │   ├── useSSENotifications.ts
│   │   └── useSSEActivities.ts
│   │
│   └── components/
│       ├── atoms/
│       │   └── NotificationBell.tsx
│       └── molecules/
│           ├── NotificationList.tsx
│           └── ActivityFeed.tsx
│
├── express/                   # Backend Express
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── NotificationController.ts
│   │   │   └── ActivityController.ts
│   │   │
│   │   ├── http/
│   │   │   ├── NotificationHttpHandler.ts
│   │   │   └── ActivityHttpHandler.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── notificationRoutes.ts
│   │   │   └── activityRoutes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── SSE/
│   │   │   │   ├── SSEService.ts
│   │   │   │   └── SSEManager.ts
│   │   │   └── ...
│   │   │
│   │   └── config/
│   │       ├── dependencies.ts
│   │       └── repositories.ts
│   │
│   └── package.json
│
├── adaptaters/
│   └── repositories/
│       └── sql/
│           ├── PostgresNotificationRepository.ts
│           └── PostgresActivityRepository.ts
│
└── database/
    ├── migrations/
    │   └── 002_add_notifications_and_activities.sql
    └── fixtures/
        └── 001_seed_notifications_activities.sql

application/
├── repositories/
│   ├── notification.ts        # Interface repository
│   └── activity.ts
├── usecases/
│   ├── notifications/
│   │   ├── SendNotificationToClient.ts
│   │   ├── GetNotificationsForClient.ts
│   │   ├── MarkNotificationAsRead.ts
│   │   ├── GetUnreadNotificationCount.ts
│   │   └── DeleteNotification.ts
│   │
│   └── activities/
│       ├── CreateActivity.ts
│       ├── GetActivities.ts
│       ├── GetActivityById.ts
│       ├── UpdateActivity.ts
│       ├── DeleteActivity.ts
│       └── GetRecentActivities.ts
│
└── requests/
    ├── notifications.ts       # DTOs
    └── activities.ts

domain/
├── entities/
│   ├── notification.ts
│   └── activity.ts
├── values/
│   ├── notificationType.ts
│   ├── notificationStatus.ts
│   └── activityPriority.ts
└── types/
    ├── NotificationWithUser.ts
    └── ActivityFeed.ts
```

---

## 🔐 Flux d'Authentification

```
Client Request
    │
    ▼
Headers:
├─ Authorization: Bearer <JWT Token>
└─ x-user-id: <User ID>
    │
    ▼
AuthGuard.requireAuthenticated()
    │
    ▼
Verify JWT + Check User ID
    │
    ├─ ✅ Valid: Proceed
    └─ ❌ Invalid: 401 Unauthorized
```

---

## 🎛️ Configuration & Variables d'Environnement

```
.env (Backend Express)
├── DATABASE_URL=postgresql://...
├── PORT=3001
├── SSE_HEARTBEAT=30000
└── JWT_SECRET=...

.env.local (Frontend Next.js)
├── NEXT_PUBLIC_API_URL=http://localhost:3001
└── NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📊 Matrice des Endpoints

| Endpoint | Méthode | Authentif | Use Case | Controller Method |
|----------|---------|-----------|----------|------------------|
| `/api/notifications` | GET | ✅ | Fetch notifications | getNotifications |
| `/api/notifications/count` | GET | ✅ | Unread count | getUnreadCount |
| `/api/notifications/send` | POST | ✅ Advisor+ | Send notif | sendNotification |
| `/api/notifications/:id/read` | POST | ✅ | Mark read | markAsRead |
| `/api/notifications/:id` | DELETE | ✅ | Delete notif | delete |
| `/api/notifications/subscribe` | GET | ✅ | SSE stream | subscribe |
| `/api/activities` | GET | ✅ | Fetch activities | getAll |
| `/api/activities/:id` | GET | ✅ | Get one | getById |
| `/api/activities/recent` | GET | ✅ | Recent | getRecent |
| `/api/activities/subscribe` | GET | ✅ | SSE stream | subscribe |

---

**Cette architecture garantit scalabilité, maintenabilité et performance!** 🚀
