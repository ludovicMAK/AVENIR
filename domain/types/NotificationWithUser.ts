import { Notification } from "@domain/entities/notification"

export type NotificationWithUser = {
  id: string
  recipientUserId: string
  recipientEmail: string
  recipientFirstname: string
  recipientLastname: string
  title: string
  message: string
  type: string
  status: string
  sentAt: Date
  readAt: Date | null
}

export type NotificationPayload = {
  notification: Notification
  recipientEmail: string
  recipientFirstname: string
  recipientLastname: string
}
