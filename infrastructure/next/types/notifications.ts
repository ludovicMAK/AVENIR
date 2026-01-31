export type NotificationType = "info" | "warning" | "error" | "news"
export type NotificationStatus = "unread" | "read"
export type ActivityPriority = "low" | "medium" | "high"

export interface User {
  id: string
  firstName: string
  lastName: string
}

export interface Notification {
  id: string
  recipientUserId: string
  senderId: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  createdAt: string
  updatedAt: string
  sender?: User
}

export interface NotificationWithUser extends Notification {
  sender: User
}

export interface Activity {
  id: string
  userId: string
  type: string
  description: string
  priority: ActivityPriority
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  author?: User
}

export interface ActivityFeed extends Activity {
  author: User
}

export interface GetNotificationsResponse {
  ok: boolean
  data?: NotificationWithUser[]
  [key: string]: unknown
}

export interface MarkAsReadResponse {
  ok: boolean
  [key: string]: unknown
}

export interface DeleteNotificationResponse {
  ok: boolean
  [key: string]: unknown
}

export interface GetUnreadCountResponse {
  ok: boolean
  data?: {
    count: number
  }
  [key: string]: unknown
}

export interface GetActivitiesResponse {
  ok: boolean
  data?: ActivityFeed[]
  [key: string]: unknown
}

export interface GetRecentActivitiesResponse {
  ok: boolean
  data?: ActivityFeed[]
  [key: string]: unknown
}
