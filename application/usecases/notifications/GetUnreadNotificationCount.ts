import { NotificationRepository } from "@application/repositories/notification"
import { ValidationError } from "@application/errors"
import { GetUnreadCountInput } from "@application/requests/notifications"

export class GetUnreadNotificationCount {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(input: GetUnreadCountInput): Promise<{ count: number }> {
    if (!input.recipientUserId || input.recipientUserId.trim().length === 0) {
      throw new ValidationError("Recipient user ID is required")
    }

    const count = await this.notificationRepository.countUnreadByRecipientId(
      input.recipientUserId
    )

    return { count }
  }
}
