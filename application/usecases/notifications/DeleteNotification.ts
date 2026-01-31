import { NotificationRepository } from "@application/repositories/notification"
import { ValidationError } from "@application/errors"
import { DeleteNotificationInput } from "@application/requests/notifications"

export class DeleteNotification {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(input: DeleteNotificationInput): Promise<void> {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new ValidationError("Notification ID is required")
    }

    // Vérifier que la notification existe
    const notification = await this.notificationRepository.findById(
      input.notificationId
    )
    if (!notification) {
      throw new ValidationError("Notification not found")
    }

    // Supprimer
    await this.notificationRepository.delete(input.notificationId)
  }
}
