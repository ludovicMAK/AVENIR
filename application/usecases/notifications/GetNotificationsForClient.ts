import { NotificationRepository } from "@application/repositories/notification"
import { ValidationError } from "@application/errors"
import { GetNotificationsInput } from "@application/requests/notifications"
import { NotificationWithUser } from "@domain/types/NotificationWithUser"
import { UserRepository } from "@application/repositories/users"

export class GetNotificationsForClient {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GetNotificationsInput): Promise<NotificationWithUser[]> {
    if (!input.recipientUserId || input.recipientUserId.trim().length === 0) {
      throw new ValidationError("Recipient user ID is required")
    }

    const user = await this.userRepository.findById(input.recipientUserId)
    if (!user) {
      throw new ValidationError("User not found")
    }

    const notifications = await this.notificationRepository.findByRecipientId(
      input.recipientUserId
    )

    return notifications.map((notification) => ({
      id: notification.id,
      recipientUserId: notification.recipientUserId,
      recipientEmail: user.email,
      recipientFirstname: user.firstname,
      recipientLastname: user.lastname,
      title: notification.title,
      message: notification.message,
      type: notification.type.getValue(),
      status: notification.status.getValue(),
      sentAt: notification.sentAt,
      readAt: notification.readAt,
    }))
  }
}
