import { NotificationRepository } from "@application/repositories/notification"
import { UserRepository } from "@application/repositories/users"
import { Notification } from "@domain/entities/notification"
import { NotificationType } from "@domain/values/notificationType"
import { NotificationStatus } from "@domain/values/notificationStatus"
import { ValidationError } from "@application/errors"
import { SendNotificationInput } from "@application/requests/notifications"
import { UuidGenerator } from "../../services/UuidGenerator"

export class SendNotificationToClient {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: SendNotificationInput): Promise<{ notificationId: string }> {
    const recipient = await this.userRepository.findById(input.recipientUserId)
    if (!recipient) {
      throw new ValidationError("Recipient user not found")
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Notification title is required")
    }

    if (!input.message || input.message.trim().length === 0) {
      throw new ValidationError("Notification message is required")
    }

    const notificationId = this.uuidGenerator.generate()
    const notificationType = NotificationType.from(input.type)
    const notification = new Notification(
      notificationId,
      input.recipientUserId,
      input.title.trim(),
      input.message.trim(),
      notificationType,
      NotificationStatus.UNREAD,
      new Date(),
      null
    )

    await this.notificationRepository.save(notification)

    return { notificationId }
  }
}
