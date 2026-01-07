import { NextRequest, NextResponse } from "next/server";
import { getAccountBalance } from "@/config/usecases";

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
  } catch (error: any) {
    return NextResponse.json(
      {
        status: error.code === "NOT_FOUND" ? 404 : 500,
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Failed to get account balance",
      },
      { status: error.code === "NOT_FOUND" ? 404 : 500 }
    );
  }
}
