import { NextResponse } from "next/server";
import { JsonValue } from "@/types/json";
import {
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
  getStatusCodeFromError,
} from "@/lib/api/errors";

export function createSuccessResponse<T extends JsonValue>(
  data: T,
  options: {
    code?: string;
    message?: string;
    status?: number;
  } = {}
) {
  const { code = "SUCCESS", message, status = 200 } = options;

  return NextResponse.json(
    {
      status,
      code,
      message,
      data,
    },
    { status }
  );
}

export function createErrorResponse(
  options: {
    code?: string;
    message?: string;
    status?: number;
    data?: JsonValue;
    error?: ErrorPayload;
  } = {}
) {
  const { code, message, status, data, error } = options;
  const resolvedStatus =
    status ?? (error ? getStatusCodeFromError(error) : 500);
  const resolvedCode =
    code ?? (error ? getErrorCode(error) : undefined) ?? "ERROR";
  const resolvedMessage =
    message ??
    (error ? getErrorMessage(error as ErrorPayload, "An error occurred") : "An error occurred");

  return NextResponse.json(
    {
      status: resolvedStatus,
      code: resolvedCode,
      message: resolvedMessage,
      data,
    },
    { status: resolvedStatus }
  );
}
