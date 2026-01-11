import { NextRequest, NextResponse } from "next/server";
import { executeMatchingOrders } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await executeMatchingOrders.execute(id);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(
          error as ErrorPayload,
          "Failed to execute matching orders"
        ),
      },
      { status: 400 }
    );
  }
}
