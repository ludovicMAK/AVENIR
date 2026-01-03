import { UnknownDueDateStatusError } from "@domain/errors"

export class DueDateStatus {
    private constructor(private readonly value: "payable" | "paid" | "overdue") {}

    static readonly PAYABLE: DueDateStatus = new DueDateStatus("payable")
    static readonly PAID: DueDateStatus = new DueDateStatus("paid")
    static readonly OVERDUE: DueDateStatus = new DueDateStatus("overdue")
    
    static from(value: string): DueDateStatus {
        switch (value) {
            case "payable":
                return DueDateStatus.PAYABLE
            case "paid":
                return DueDateStatus.PAID
            case "overdue":
                return DueDateStatus.OVERDUE
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
