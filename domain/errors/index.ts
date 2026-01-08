import { DomainErrorDetail } from "@domain/types/errors";

export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: DomainErrorDetail;

  constructor(code: string, message: string, details?: DomainErrorDetail) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.details = details;
  }
}

export class UnknownRoleError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_ROLE", `Unknown role: ${value}`, {
      issue: "unknown_role",
      context: { value },
    });
  }
}
export class UnknownStatusAccountError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_STATUS_ACCOUNT", `Unknown status account: ${value}`, {
      issue: "unknown_status_account",
      context: { value },
    });
  }
}
export class UnknownAccountTypeError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_ACCOUNT_TYPE", `Unknown account type: ${value}`, {
      issue: "unknown_account_type",
      context: { value },
    });
  }
}
export class UnknownDirectionError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_DIRECTION", `Unknown direction: ${value}`, {
      issue: "unknown_direction",
      context: { value },
    });
  }
}
export class UnknownStatusTransferError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_STATUS_TRANSFER", `Unknown status transfer: ${value}`, {
      issue: "unknown_status_transfer",
      context: { value },
    });
  }
}
export class UnknownStatusTransactionError extends DomainError {
  constructor(value: string) {
    super(
      "UNKNOWN_STATUS_TRANSACTION",
      `Unknown status transaction: ${value}`,
      {
        issue: "unknown_status_transaction",
        context: { value },
      }
    );
  }
}
export class UnknownConversationStatusError extends DomainError {
  constructor(value: string) {
    super(
      "UNKNOWN_CONVERSATION_STATUS",
      `Unknown conversation status: ${value}`,
      {
        issue: "unknown_conversation_status",
        context: { value },
      }
    );
  }
}
export class UnknownConversationTypeError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_CONVERSATION_TYPE", `Unknown conversation type: ${value}`, {
      issue: "unknown_conversation_type",
      context: { value },
    });
  }
}

export class UnknownCreditStatusError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_CREDIT_STATUS", `Unknown credit status: ${value}`, {
      issue: "unknown_credit_status",
      context: { value },
    });
  }
}

export class UnknownDueDateStatusError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_DUE_DATE_STATUS", `Unknown due date status: ${value}`, {
      issue: "unknown_due_date_status",
      context: { value },
    });
  }
}

export class UnknownCreditModeError extends DomainError {
  constructor(value: string) {
    super("UNKNOWN_CREDIT_MODE", `Unknown credit mode: ${value}`, {
      issue: "unknown_credit_mode",
      context: { value },
    });
  }
}

export class InvalidShareDataError extends DomainError {
  constructor(message: string, details?: DomainErrorDetail) {
    super("INVALID_SHARE_DATA", message, details);
  }
}
