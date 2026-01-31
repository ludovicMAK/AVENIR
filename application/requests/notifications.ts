export type SendNotificationInput = {
  recipientUserId: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "news"
}

export type GetNotificationsInput = {
  recipientUserId: string
}

export type MarkNotificationAsReadInput = {
  notificationId: string
}

export type MarkMultipleNotificationsAsReadInput = {
  notificationIds: string[]
}

export type GetUnreadCountInput = {
  recipientUserId: string
}

export type DeleteNotificationInput = {
  notificationId: string
}
