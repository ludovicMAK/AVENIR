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
export class UnknownStatusAccountError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_STATUS_ACCOUNT", `Unknown status account: ${value}`, {
            issue: "unknown_status_account",
            context: { value },
        })
    }
}
export class UnknownAccountTypeError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_ACCOUNT_TYPE", `Unknown account type: ${value}`, {
            issue: "unknown_account_type",
            context: { value },
        })
    }
}
export class UnknownDirectionError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_DIRECTION", `Unknown direction: ${value}`, {
            issue: "unknown_direction",
            context: { value },
        })
    }
}
export class UnknownStatusTransferError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_STATUS_TRANSFER", `Unknown status transfer: ${value}`, {
            issue: "unknown_status_transfer",
            context: { value },
        })
    }
}
export class UnknownStatusTransactionError extends DomainError {
    constructor(value: string) {
        super("UNKNOWN_STATUS_TRANSACTION", `Unknown status transaction: ${value}`, {
            issue: "unknown_status_transaction",
            context: { value },
        })
    }
}