import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/config/usecases";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
} from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await registerUser.execute(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Registration failed") },
      {
        status:
          getErrorCode(error as ErrorPayload) === "CONFLICT"
            ? ErrorCode.CONFLICT
            : ErrorCode.BAD_REQUEST,
      }
    );
  }
}
