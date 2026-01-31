import { UnknownNotificationStatusError } from "@domain/errors"

export class NotificationStatus {
    private constructor(private readonly value: "unread" | "read") {}

    static readonly UNREAD: NotificationStatus = new NotificationStatus("unread")
    static readonly READ: NotificationStatus = new NotificationStatus("read")

    static from(value: string): NotificationStatus {
        switch (value) {
            case "unread":
                return NotificationStatus.UNREAD
            case "read":
                return NotificationStatus.READ
            default:
                throw new UnknownNotificationStatusError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: NotificationStatus): boolean {
        return this.value === other.value
    }

    isRead(): boolean {
        return this.value === "read"
    }

    isUnread(): boolean {
        return this.value === "unread"
    }
}
