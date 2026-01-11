import { NextResponse } from "next/server";
import { JsonValue } from "@/types/json";

export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ErrorPayload =
  | ApiError
  | Error
  | { code?: string; message?: string; stack?: string }
  | string;

const ERROR_CODE_MAP: Record<string, ErrorCode> = {
  UNAUTHORIZED: ErrorCode.UNAUTHORIZED,
  FORBIDDEN: ErrorCode.FORBIDDEN,
  NOT_FOUND: ErrorCode.NOT_FOUND,
  CONFLICT: ErrorCode.CONFLICT,
  INVALID_INPUT: ErrorCode.BAD_REQUEST,
  VALIDATION_ERROR: ErrorCode.BAD_REQUEST,
};

export function getErrorCode(
  error: ErrorPayload
): string | undefined {
  if (typeof error === "string") {
    return undefined;
  }
  if (error instanceof ApiError) {
    return error.code;
  }
  if (error instanceof Error) {
    return undefined;
  }
  return error.code;
}

export function getErrorMessage(
  error: ErrorPayload,
  fallback = "An unexpected error occurred"
): string {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return error.message ?? fallback;
}

export function getStatusCodeFromError(error: ErrorPayload): number {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  const mappedCode = getErrorCode(error);
  return mappedCode ? ERROR_CODE_MAP[mappedCode] ?? ErrorCode.INTERNAL_SERVER_ERROR : ErrorCode.INTERNAL_SERVER_ERROR;
}

export function handleError(error: ErrorPayload): NextResponse {
  const statusCode = getStatusCodeFromError(error);
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  if (statusCode >= 500) {
    console.error("API Error:", error);
  }

  return NextResponse.json(
    {
      error: message,
      code,
      ...(process.env.NODE_ENV === "development" &&
        typeof error !== "string" &&
        "stack" in error && { stack: (error as Error).stack }),
    },
    { status: statusCode }
  );
}

export async function asyncHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse | T> {
  try {
    return await handler();
  } catch (error) {
    return handleError(error as ErrorPayload);
  }
}

export function successResponse<T extends JsonValue>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export function createdResponse<T extends JsonValue>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
