import { NotificationRepository } from "@application/repositories/notification"
import { ValidationError } from "@application/errors"
import { MarkNotificationAsReadInput } from "@application/requests/notifications"

export class MarkNotificationAsRead {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(input: MarkNotificationAsReadInput): Promise<void> {
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

    // Marquer comme lue
    await this.notificationRepository.markAsRead(input.notificationId)
  }
}
