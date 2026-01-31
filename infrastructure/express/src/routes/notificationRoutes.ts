import { Router } from "express"
import { NotificationHttpHandler } from "@express/src/http/NotificationHttpHandler"

export function createNotificationRoutes(
  notificationHttpHandler: NotificationHttpHandler
): Router {
  const router = Router()

  // Send notification (advisor/manager only)
  router.post("/notifications/send", (request, response) =>
    notificationHttpHandler.sendNotification(request, response)
  )

  // Get all notifications for authenticated user
  router.get("/notifications", (request, response) =>
    notificationHttpHandler.getNotifications(request, response)
  )

  // Get unread count
  router.get("/notifications/unread-count", (request, response) =>
    notificationHttpHandler.getUnreadCount(request, response)
  )

  // Mark notification as read
  router.patch("/notifications/:notificationId/read", (request, response) =>
    notificationHttpHandler.markAsRead(request, response)
  )

  // Delete notification
  router.delete("/notifications/:notificationId", (request, response) =>
    notificationHttpHandler.deleteNotification(request, response)
  )

  // Subscribe to notifications via SSE
  router.get("/notifications/subscribe", (request, response) =>
    notificationHttpHandler.subscribe(request, response)
  )

  return router
}
