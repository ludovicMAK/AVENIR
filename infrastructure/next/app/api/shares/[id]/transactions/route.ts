import { NextRequest, NextResponse } from "next/server";
import { getShareTransactionHistory } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await getShareTransactionHistory.execute(id);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to get transaction history") },
      { status: 400 }
    );
  }
}
