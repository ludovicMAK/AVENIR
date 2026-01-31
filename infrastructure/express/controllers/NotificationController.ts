import { SendNotificationToClient } from "@application/usecases/notifications/SendNotificationToClient"
import { GetNotificationsForClient } from "@application/usecases/notifications/GetNotificationsForClient"
import { MarkNotificationAsRead } from "@application/usecases/notifications/MarkNotificationAsRead"
import { GetUnreadNotificationCount } from "@application/usecases/notifications/GetUnreadNotificationCount"
import { DeleteNotification } from "@application/usecases/notifications/DeleteNotification"
import {
  SendNotificationInput,
  GetNotificationsInput,
  MarkNotificationAsReadInput,
  GetUnreadCountInput,
  DeleteNotificationInput,
} from "@application/requests/notifications"
import { NotificationWithUser } from "@domain/types/NotificationWithUser"

export class NotificationController {
  public constructor(
    private readonly sendNotificationToClient: SendNotificationToClient,
    private readonly getNotificationsForClient: GetNotificationsForClient,
    private readonly markNotificationAsRead: MarkNotificationAsRead,
    private readonly getUnreadNotificationCount: GetUnreadNotificationCount,
    private readonly deleteNotification: DeleteNotification
  ) {}

  public async sendNotification(
    payload: SendNotificationInput
  ): Promise<{ notificationId: string }> {
    return await this.sendNotificationToClient.execute(payload)
  }

  public async getNotifications(
    payload: GetNotificationsInput
  ): Promise<NotificationWithUser[]> {
    return await this.getNotificationsForClient.execute(payload)
  }

  public async markAsRead(payload: MarkNotificationAsReadInput): Promise<void> {
    return await this.markNotificationAsRead.execute(payload)
  }

  public async getUnreadCount(payload: GetUnreadCountInput): Promise<{ count: number }> {
    return await this.getUnreadNotificationCount.execute(payload)
  }

  public async delete(payload: DeleteNotificationInput): Promise<void> {
    return await this.deleteNotification.execute(payload)
  }
}
