export class DomainError extends Error {
    public readonly code: string
    public readonly details?: unknown

    constructor(code: string, message: string, details?: unknown) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
        this.code = code
        this.details = details
    }
}

export class UnknownRoleError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_ROLE", `Unknown role: ${value}`, { value })
    }
}
