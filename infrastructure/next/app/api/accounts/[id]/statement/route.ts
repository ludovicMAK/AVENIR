import { NextRequest, NextResponse } from "next/server";
import { getAccountStatement } from "@/config/usecases";
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

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!fromDate || !toDate) {
      return NextResponse.json(
        {
          status: 400,
          code: "MISSING_DATES",
          message:
            "Start date (fromDate) and end date (toDate) are required.",
        },
        { status: 400 }
      );
    }

    const statementData = await getAccountStatement.execute({
      accountId: id,
      userId,
      token,
      fromDate,
      toDate,
    });

    return NextResponse.json(
      {
        status: 200,
        code: "STATEMENT_RETRIEVED",
        message: "Account statement successfully retrieved.",
        data: statementData,
      },
      { status: 200 }
    );
  } catch (error) {
    const code = getErrorCode(error as ErrorPayload) ?? "INTERNAL_ERROR";
    const status =
      code === "NOT_FOUND"
        ? ErrorCode.NOT_FOUND
        : getStatusCodeFromError(error as ErrorPayload);
    return NextResponse.json(
      {
        status,
        code,
        message: getErrorMessage(error as ErrorPayload, "Failed to get account statement"),
      },
      { status }
    );
  }
}
