import { NextRequest, NextResponse } from "next/server";
import { getAccountTransactions } from "@/config/usecases";
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
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const direction = searchParams.get("direction") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const transactionsData = await getAccountTransactions.execute({
      accountId: id,
      userId,
      token,
      startDate,
      endDate,
      direction,
      status,
      page,
      limit,
    });

    return NextResponse.json(
      {
        status: 200,
        code: "TRANSACTIONS_RETRIEVED",
        message: "Account transactions successfully retrieved.",
        data: transactionsData,
      },
      { status: 200 }
    );
  } catch (error) {
    const code = getErrorCode(error as ErrorPayload) ?? "INTERNAL_ERROR";
    const status =
      code === "NOT_FOUND" ? ErrorCode.NOT_FOUND : getStatusCodeFromError(error as ErrorPayload);
    return NextResponse.json(
      {
        status,
        code,
        message: getErrorMessage(
          error as ErrorPayload,
          "Failed to get account transactions"
        ),
      },
      { status }
    );
  }
}
