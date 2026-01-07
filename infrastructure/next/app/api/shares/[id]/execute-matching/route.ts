import { NextRequest, NextResponse } from "next/server";
import { executeMatchingOrders } from "@/config/usecases";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactions = await executeMatchingOrders.execute(params.id);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute matching orders" },
      { status: 400 }
    );
  }
}
