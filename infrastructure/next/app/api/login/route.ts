import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/config/usecases";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await loginUser.execute(body);

    return createSuccessResponse(session, {
      code: "LOGIN_SUCCESS",
      message: "Login successful",
      status: 200,
    });
  } catch (error: any) {
    return createErrorResponse({
      code: error.code || "LOGIN_FAILED",
      message: error.message || "Login failed",
      status: error.code === "UNAUTHORIZED" ? 401 : 400,
    });
  }
}
