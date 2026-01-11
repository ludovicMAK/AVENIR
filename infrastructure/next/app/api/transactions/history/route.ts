import { NextRequest, NextResponse } from "next/server";
import { getTransactionHistory } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const result = await getTransactionHistory.execute({
      userId,
      token,
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to get transaction history") },
      { status: 400 }
    );
  }
}
