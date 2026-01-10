import { NextResponse } from "next/server";

export function createSuccessResponse<T = any>(
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
    data?: any;
  } = {}
) {
  const {
    code = "ERROR",
    message = "An error occurred",
    status = 500,
    data,
  } = options;

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
