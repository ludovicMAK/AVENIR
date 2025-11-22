import { UnknownRoleError } from "@domain/errors"

export class Role {
    private constructor(private readonly value: "customer" | "bankManager" | "bankAdvisor") {}

    static readonly CUSTOMER: Role = new Role("customer")
    static readonly MANAGER: Role = new Role("bankManager")
    static readonly ADVISOR: Role = new Role("bankAdvisor")

    static from(value: string): Role {
        switch (value) {
            case "customer":
                return Role.CUSTOMER
            case "bankManager":
                return Role.MANAGER
            case "bankAdvisor":
                return Role.ADVISOR
            default:
                throw new UnknownRoleError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: Role): boolean {
        return this.value === other.value
    }
}