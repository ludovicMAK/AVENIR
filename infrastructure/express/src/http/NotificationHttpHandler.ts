import { Request, Response } from "express"
import { NotificationController } from "@express/controllers/NotificationController"
import { ValidationError } from "@application/errors"
import { mapErrorToHttpResponse } from "@express/src/responses/error"
import { sendSuccess } from "@express/src/responses/success"
import { AuthGuard } from "@express/src/http/AuthGuard"
import { SSEManager } from "@express/src/services/SSE/SSEManager"
import { NotificationWithUser } from "@domain/types/NotificationWithUser"

export class NotificationHttpHandler {
  constructor(
    private readonly controller: NotificationController,
    private readonly authGuard: AuthGuard
  ) {}

  public async sendNotification(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      // Vérifier que l'user est conseiller ou directeur
      if (authUser.role.getValue() !== "bankAdvisor" && authUser.role.getValue() !== "bankManager") {
        throw new ValidationError("Only advisors and managers can send notifications")
      }

      const { recipientUserId, title, message, type } = request.body

      if (!recipientUserId || !title || !message || !type) {
        throw new ValidationError("Missing required fields")
      }

      const result = await this.controller.sendNotification({
        recipientUserId,
        title,
        message,
        type,
      })

      return sendSuccess(response, {
        status: 201,
        code: "NOTIFICATION_SENT",
        message: "Notification sent successfully",
        data: result,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async getNotifications(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      const notifications = await this.controller.getNotifications({
        recipientUserId: authUser.id,
      })

      return sendSuccess<NotificationWithUser[]>(response, {
        status: 200,
        code: "NOTIFICATIONS_FETCHED",
        message: "Notifications fetched successfully",
        data: notifications,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async getUnreadCount(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      const result = await this.controller.getUnreadCount({
        recipientUserId: authUser.id,
      })

      return sendSuccess(response, {
        status: 200,
        code: "UNREAD_COUNT_FETCHED",
        message: "Unread count fetched successfully",
        data: result,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async markAsRead(request: Request, response: Response) {
    try {
      await this.authGuard.requireAuthenticated(request)

      const { notificationId } = request.body
      if (!notificationId) {
        throw new ValidationError("Notification ID is required")
      }

      await this.controller.markAsRead({ notificationId })

      return sendSuccess(response, {
        status: 200,
        code: "NOTIFICATION_MARKED_AS_READ",
        message: "Notification marked as read",
        data: null,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async deleteNotification(request: Request, response: Response) {
    try {
      await this.authGuard.requireAuthenticated(request)

      const { notificationId } = request.params
      if (!notificationId) {
        throw new ValidationError("Notification ID is required")
      }

      await this.controller.delete({ notificationId })

      return sendSuccess(response, {
        status: 200,
        code: "NOTIFICATION_DELETED",
        message: "Notification deleted successfully",
        data: null,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async subscribe(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)
      const sseService = SSEManager.getInstance()
      sseService.addClient(authUser.id, response, "notifications")
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }
}
