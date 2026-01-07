import { UnknownDueDateStatusError } from "@domain/errors"

export class DueDateStatus {
    private constructor(private readonly value: "payable" | "paid" | "overdue" | "cancelled") {}

    static readonly PAYABLE: DueDateStatus = new DueDateStatus("payable")
    static readonly PAID: DueDateStatus = new DueDateStatus("paid")
    static readonly OVERDUE: DueDateStatus = new DueDateStatus("overdue")
    static readonly CANCELLED: DueDateStatus = new DueDateStatus("cancelled")
    
    static from(value: string): DueDateStatus {
        switch (value) {
            case "payable":
                return DueDateStatus.PAYABLE
            case "paid":
                return DueDateStatus.PAID
            case "overdue":
                return DueDateStatus.OVERDUE
            case "cancelled":
                return DueDateStatus.CANCELLED
            default:
                throw new UnknownDueDateStatusError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: DueDateStatus): boolean {
        return this.value === other.value
    }
}
