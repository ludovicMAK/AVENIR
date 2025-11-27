import { UnknownStatusAccountError } from "@domain/errors"

export class StatusAccount {
    private constructor(private readonly value: "open" | "close") {}

    static readonly OPEN: StatusAccount = new StatusAccount("open")
    static readonly CLOSE: StatusAccount = new StatusAccount("close")
    static from(value: string): StatusAccount {
        switch (value) {
            case "open":
                return StatusAccount.OPEN
            case "close":
                return StatusAccount.CLOSE
            default:
                throw new UnknownStatusAccountError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: StatusAccount): boolean {
        return this.value === other.value
    }
}