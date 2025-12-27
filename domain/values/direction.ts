import { UnknownDirectionError } from "@domain/errors"

export class Direction {
    private constructor(private readonly value: "debit" | "credit") {}

    static readonly DEBIT: Direction = new Direction("debit")
    static readonly CREDIT: Direction = new Direction("credit")

    static from(value: string): Direction {
        switch (value) {
            case "debit":
                return Direction.DEBIT
            case "credit":
                return Direction.CREDIT
            default:
                throw new UnknownDirectionError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: Direction): boolean {
        return this.value === other.value
    }
}