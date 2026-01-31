import { Pool } from "pg"
import { NotificationRepository } from "@application/repositories/notification"
import { Notification } from "@domain/entities/notification"
import { NotificationType } from "@domain/values/notificationType"
import { NotificationStatus } from "@domain/values/notificationStatus"
import { InfrastructureError } from "@application/errors"
import { ensureError, ErrorLike } from "@application/utils/errors"

interface NotificationRow {
  id: string
  recipient_user_id: string
  title: string
  message: string
  type: string
  status: string
  sent_at: Date
  read_at: Date | null
}

export class PostgresNotificationRepository implements NotificationRepository {
  constructor(private readonly pool: Pool) {}

  async save(notification: Notification): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO notifications (id, recipient_user_id, title, message, type, status, sent_at, read_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          notification.id,
          notification.recipientUserId,
          notification.title,
          notification.message,
          notification.type.getValue(),
          notification.status.getValue(),
          notification.sentAt,
          notification.readAt,
        ]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      const result = await this.pool.query<NotificationRow>(
        `
          SELECT id, recipient_user_id, title, message, type, status, sent_at, read_at
          FROM notifications
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      )

      if (result.rowCount === 0) {
        return null
      }

      return this.mapRowToNotification(result.rows[0])
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findByRecipientId(recipientUserId: string): Promise<Notification[]> {
    try {
      const result = await this.pool.query<NotificationRow>(
        `
          SELECT id, recipient_user_id, title, message, type, status, sent_at, read_at
          FROM notifications
          WHERE recipient_user_id = $1
          ORDER BY sent_at DESC
        `,
        [recipientUserId]
      )

      return result.rows.map((row) => this.mapRowToNotification(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findUnreadByRecipientId(recipientUserId: string): Promise<Notification[]> {
    try {
      const result = await this.pool.query<NotificationRow>(
        `
          SELECT id, recipient_user_id, title, message, type, status, sent_at, read_at
          FROM notifications
          WHERE recipient_user_id = $1 AND status = 'unread'
          ORDER BY sent_at DESC
        `,
        [recipientUserId]
      )

      return result.rows.map((row) => this.mapRowToNotification(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          UPDATE notifications
          SET status = 'read', read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [notificationId]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) {
      return
    }

    try {
      const placeholders = notificationIds.map((_, i) => `$${i + 1}`).join(",")
      await this.pool.query(
        `
          UPDATE notifications
          SET status = 'read', read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id IN (${placeholders})
        `,
        notificationIds
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async delete(notificationId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM notifications
          WHERE id = $1
        `,
        [notificationId]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async deleteOldNotifications(daysOld: number): Promise<number> {
    try {
      const result = await this.pool.query(
        `
          DELETE FROM notifications
          WHERE sent_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
          RETURNING id
        `
      )

      return result.rowCount || 0
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async countUnreadByRecipientId(recipientUserId: string): Promise<number> {
    try {
      const result = await this.pool.query<{ count: string }>(
        `
          SELECT COUNT(*) as count
          FROM notifications
          WHERE recipient_user_id = $1 AND status = 'unread'
        `,
        [recipientUserId]
      )

      return parseInt(result.rows[0]?.count || "0", 10)
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  private mapRowToNotification(row: NotificationRow): Notification {
    return new Notification(
      row.id,
      row.recipient_user_id,
      row.title,
      row.message,
      NotificationType.from(row.type),
      NotificationStatus.from(row.status),
      row.sent_at,
      row.read_at
    )
  }

  private handleDatabaseError(error: ErrorLike): never {
    const err = ensureError(error)
    throw new InfrastructureError(
      `Notification repository error: ${err.message}`,
      {
        scope: "infrastructure",
        issues: [{ message: "database_error" }],
        metadata: { originalError: err.message },
      }
    )
  }
}
