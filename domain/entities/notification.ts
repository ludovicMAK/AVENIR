import { NotificationType } from "@domain/values/notificationType"
import { NotificationStatus } from "@domain/values/notificationStatus"

export class Notification {
  constructor(
    readonly id: string,
    readonly recipientUserId: string,
    readonly title: string,
    readonly message: string,
    readonly type: NotificationType,
    readonly status: NotificationStatus,
    readonly sentAt: Date,
    readonly readAt: Date | null = null
  ) {}

  isRead(): boolean {
    return this.status.isRead()
  }

  isUnread(): boolean {
    return this.status.isUnread()
  }

  markAsRead(): Notification {
    if (this.isRead()) {
      return this
    }
    return new Notification(
      this.id,
      this.recipientUserId,
      this.title,
      this.message,
      this.type,
      NotificationStatus.READ,
      this.sentAt,
      new Date()
    )
  }

  isRecent(hoursThreshold: number = 24): boolean {
    const now = new Date()
    const diffMs = now.getTime() - this.sentAt.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours < hoursThreshold
  }

  isFromAdvisorOrManager(): boolean {
    return true
  }
}
