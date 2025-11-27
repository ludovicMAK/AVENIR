import { UnknownAccountTypeError } from "@domain/errors"

export class AccountType {
    private constructor(private readonly value: "current" | "savings") {}

    static readonly CURRENT: AccountType = new AccountType("current")
    static readonly SAVINGS: AccountType = new AccountType("savings")
    static from(value: string): AccountType {
        switch (value) {
            case "current":
                return AccountType.CURRENT
            case "savings":
                return AccountType.SAVINGS
            default:
                throw new UnknownAccountTypeError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: AccountType): boolean {
        return this.value === other.value
    }
}