import { Notification } from "@domain/entities/notification"
import { NotificationStatus } from "@domain/values/notificationStatus"

export interface NotificationRepository {
  save(notification: Notification): Promise<void>
  findById(id: string): Promise<Notification | null>
  findByRecipientId(recipientUserId: string): Promise<Notification[]>
  findUnreadByRecipientId(recipientUserId: string): Promise<Notification[]>
  markAsRead(notificationId: string): Promise<void>
  markMultipleAsRead(notificationIds: string[]): Promise<void>
  delete(notificationId: string): Promise<void>
  deleteOldNotifications(daysOld: number): Promise<number>
  countUnreadByRecipientId(recipientUserId: string): Promise<number>
}
