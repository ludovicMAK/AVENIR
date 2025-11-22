import { DomainErrorDetail } from "@domain/types/errors"

export class DomainError extends Error {
    public readonly code: string
    public readonly details?: DomainErrorDetail

    constructor(code: string, message: string, details?: DomainErrorDetail) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
        this.code = code
        this.details = details
    }
}

export class UnknownRoleError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_ROLE", `Unknown role: ${value}`, {
            issue: "unknown_role",
            context: { value },
        })
    }
}