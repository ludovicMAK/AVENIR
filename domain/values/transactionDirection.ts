import { UnknownDirectionError } from "@domain/errors"

export class TransactionDirection {
    private constructor(private readonly value: "debit" | "credit") {}

    static readonly DEBIT: TransactionDirection = new TransactionDirection("debit")
    static readonly CREDIT: TransactionDirection = new TransactionDirection("credit")

    static from(value: string): TransactionDirection {
        switch (value) {
            case "debit":
                return TransactionDirection.DEBIT
            case "credit":
                return TransactionDirection.CREDIT
            default:
                throw new UnknownDirectionError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: TransactionDirection): boolean {
        return this.value === other.value
    }
}