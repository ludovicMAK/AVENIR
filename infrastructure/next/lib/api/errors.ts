import { NextResponse } from "next/server";

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

/**
 * Map application errors to HTTP status codes
 */
export function getStatusCodeFromError(error: any): number {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  // Map application error codes to HTTP status
  const errorCodeMap: Record<string, number> = {
    UNAUTHORIZED: ErrorCode.UNAUTHORIZED,
    FORBIDDEN: ErrorCode.FORBIDDEN,
    NOT_FOUND: ErrorCode.NOT_FOUND,
    CONFLICT: ErrorCode.CONFLICT,
    INVALID_INPUT: ErrorCode.BAD_REQUEST,
    VALIDATION_ERROR: ErrorCode.BAD_REQUEST,
  };

  return errorCodeMap[error.code] || ErrorCode.INTERNAL_SERVER_ERROR;
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: any): NextResponse {
  const statusCode = getStatusCodeFromError(error);
  const message = error.message || "An unexpected error occurred";

  // Log error for debugging (in production, use proper logging service)
  if (statusCode >= 500) {
    console.error("API Error:", error);
  }

  return NextResponse.json(
    {
      error: message,
      code: error.code,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
    { status: statusCode }
  );
}

/**
 * Async handler wrapper with error handling
 */
export async function asyncHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse | T> {
  try {
    return await handler();
  } catch (error: any) {
    return handleError(error);
  }
}

/**
 * Success response helper
 */
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Created response helper
 */
export function createdResponse(data: any): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

/**
 * No content response helper
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
