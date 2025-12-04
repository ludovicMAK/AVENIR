import {
  ApplicationErrorDetail,
  ApplicationErrorPayload,
} from "@application/types/errors";

export abstract class ApplicationError extends Error {
  public readonly code: string;
  public readonly details?: ApplicationErrorDetail;

  protected constructor(
    code: string,
    message: string,
    details?: ApplicationErrorDetail
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }

  public toPayload(): ApplicationErrorPayload {
    const payload: ApplicationErrorPayload = {
      ok: false,
      code: this.code,
      message: this.message,
    };
    if (this.details !== undefined) payload.data = this.details;
    return payload;
  }
}

export class ValidationError extends ApplicationError {
  public constructor(
    message = "Invalid data",
    details?: ApplicationErrorDetail
  ) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends ApplicationError {
  public constructor(
    message = "Unauthorized",
    details?: ApplicationErrorDetail
  ) {
    super("UNAUTHORIZED", message, details);
  }
}

export class NotFoundError extends ApplicationError {
  public constructor(message = "Not found", details?: ApplicationErrorDetail) {
    super("NOT_FOUND", message, details);
  }
}

export class ConflictError extends ApplicationError {
  public constructor(message = "Conflict", details?: ApplicationErrorDetail) {
    super("CONFLICT", message, details);
  }
}

export class UnprocessableError extends ApplicationError {
  public constructor(
    message = "Unprocessable entity",
    details?: ApplicationErrorDetail
  ) {
    super("APPLICATION_ERROR", message, details);
  }
}

export class InfrastructureError extends ApplicationError {
  public constructor(
    message = "Internal server error",
    details?: ApplicationErrorDetail
  ) {
    super("INFRASTRUCTURE_ERROR", message, details);
  }
}

export class AccountNotFoundError extends NotFoundError {
  public constructor(
    message = "Account not found",
    details?: ApplicationErrorDetail
  ) {
    super(message, details);
  }
}
