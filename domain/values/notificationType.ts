import { UnknownNotificationTypeError } from "@domain/errors"

export class NotificationType {
    private constructor(private readonly value: "info" | "warning" | "error" | "news") {}

    static readonly INFO: NotificationType = new NotificationType("info")
    static readonly WARNING: NotificationType = new NotificationType("warning")
    static readonly ERROR: NotificationType = new NotificationType("error")
    static readonly NEWS: NotificationType = new NotificationType("news")

    static from(value: string): NotificationType {
        switch (value) {
            case "info":
                return NotificationType.INFO
            case "warning":
                return NotificationType.WARNING
            case "error":
                return NotificationType.ERROR
            case "news":
                return NotificationType.NEWS
            default:
                throw new UnknownNotificationTypeError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: NotificationType): boolean {
        return this.value === other.value
    }
}
