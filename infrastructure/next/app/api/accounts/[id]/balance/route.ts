import { NextRequest, NextResponse } from "next/server";
import { getAccountBalance } from "@/config/usecases";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
  getStatusCodeFromError,
} from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { id } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const balanceData = await getAccountBalance.execute({
      accountId: id,
      userId,
      token,
    });

    return NextResponse.json(
      {
        status: 200,
        code: "BALANCE_RETRIEVED",
        message: "Account balance successfully retrieved.",
        data: balanceData,
      },
      { status: 200 }
    );
  } catch (error) {
    let code: string = "INTERNAL_ERROR";
    let status: number = 500;
    let message = "Failed to get account balance";
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: string | number | boolean | symbol | null }).code === "string"
    ) {
      code = (error as { code: string }).code;
    } else {
      code = getErrorCode(error as ErrorPayload) ?? "INTERNAL_ERROR";
    }
    if (code === "NOT_FOUND") {
      status = ErrorCode.NOT_FOUND;
    } else {
      status = getStatusCodeFromError(error as ErrorPayload);
    }
    message = getErrorMessage(error as ErrorPayload, "Failed to get account balance");
    return NextResponse.json(
      {
        status,
        code,
        message,
      },
      { status }
    );
  }
}
