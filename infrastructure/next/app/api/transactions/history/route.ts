import { NextRequest, NextResponse } from "next/server";
import { getTransactionHistory } from "@/config/usecases";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    console.log("[GET /api/transactions/history] Headers received:", {
      userId,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 10) + "...",
    });

    if (!userId || !token) {
      console.log("[GET /api/transactions/history] Missing auth headers");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(
      "[GET /api/transactions/history] Executing use case with userId:",
      userId
    );
    const result = await getTransactionHistory.execute({
      userId,
      token,
    });
    console.log(
      "[GET /api/transactions/history] Success! Result:",
      JSON.stringify(result, null, 2)
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/transactions/history] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || "Failed to get transaction history" },
      { status: 400 }
    );
  }
}
