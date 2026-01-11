import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/config/usecases";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
} from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await loginUser.execute(body);
    return createSuccessResponse(session, {
      code: "LOGIN_SUCCESS",
      message: "Login successful",
      status: 200,
    });
  } catch (error) {
    const code = getErrorCode(error as ErrorPayload) ?? "LOGIN_FAILED";
    return createErrorResponse({
      code,
      message: getErrorMessage(error as ErrorPayload, "Login failed"),
      status:
        code === "UNAUTHORIZED" ? ErrorCode.UNAUTHORIZED : ErrorCode.BAD_REQUEST,
      error: error as ErrorPayload | undefined,
    });
  }
}
