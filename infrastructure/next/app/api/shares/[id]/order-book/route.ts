import { NextRequest, NextResponse } from "next/server";
import { getOrderBook } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderBook = await getOrderBook.execute(params.id);
    return NextResponse.json(orderBook, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get order book" },
      { status: 400 }
    );
  }
}
