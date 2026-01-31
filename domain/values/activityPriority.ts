import { UnknownActivityPriorityError } from "@domain/errors"

export class ActivityPriority {
    private constructor(private readonly value: "low" | "medium" | "high") {}

    static readonly LOW: ActivityPriority = new ActivityPriority("low")
    static readonly MEDIUM: ActivityPriority = new ActivityPriority("medium")
    static readonly HIGH: ActivityPriority = new ActivityPriority("high")

    static from(value: string): ActivityPriority {
        switch (value) {
            case "low":
                return ActivityPriority.LOW
            case "medium":
                return ActivityPriority.MEDIUM
            case "high":
                return ActivityPriority.HIGH
            default:
                throw new UnknownActivityPriorityError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: ActivityPriority): boolean {
        return this.value === other.value
    }
}
