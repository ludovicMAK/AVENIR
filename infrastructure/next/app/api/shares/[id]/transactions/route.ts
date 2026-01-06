import { NextRequest, NextResponse } from "next/server";
import { getShareTransactionHistory } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactions = await getShareTransactionHistory.execute(params.id);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get transaction history" },
      { status: 400 }
    );
  }
}
