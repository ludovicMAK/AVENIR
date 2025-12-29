import { UnknownStatusTransactionError } from "@domain/errors"

export class StatusTransaction {
    private constructor(private readonly value: "posted" | "validated") {}

    static readonly VALIDATED: StatusTransaction = new StatusTransaction("validated")
    static readonly POSTED: StatusTransaction = new StatusTransaction("posted")

    static from(value: string): StatusTransaction {
        switch (value) {
            case "posted":
                return StatusTransaction.POSTED
            case "validated":
                return StatusTransaction.VALIDATED
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