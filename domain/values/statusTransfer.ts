import { UnknownStatusTransferError } from "@domain/errors"

export class StatusTransfer {
    private constructor(private readonly value: "pending" | "validated"| "cancelled") {}

    static readonly PENDING: StatusTransfer = new StatusTransfer("pending")
    static readonly VALIDATED: StatusTransfer = new StatusTransfer("validated")
    static readonly CANCELLED: StatusTransfer = new StatusTransfer("cancelled")

    static from(value: string): StatusTransfer {
        switch (value) {
            case "pending":
                return StatusTransfer.PENDING
            case "validated":
                return StatusTransfer.VALIDATED
            case "cancelled":
                return StatusTransfer.CANCELLED
            default:
                throw new UnknownStatusTransferError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: StatusTransfer): boolean {
        return this.value === other.value
    }
}