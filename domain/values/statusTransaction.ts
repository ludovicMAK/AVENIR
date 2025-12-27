import { UnknownStatusTransactionError } from "@domain/errors"

export class StatusTransaction {
    private constructor(private readonly value: "pending" | "validated"| "cancelled") {}

    static readonly PENDING: StatusTransaction = new StatusTransaction("pending")
    static readonly VALIDATED: StatusTransaction = new StatusTransaction("validated")
    static readonly CANCELLED: StatusTransaction = new StatusTransaction("cancelled")

    static from(value: string): StatusTransaction {
        switch (value) {
            case "pending":
                return StatusTransaction.PENDING
            case "validated":
                return StatusTransaction.VALIDATED
            case "cancelled":
                return StatusTransaction.CANCELLED
            default:
                throw new UnknownStatusTransactionError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: StatusTransaction): boolean {
        return this.value === other.value
    }
}