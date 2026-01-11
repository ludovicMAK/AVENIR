import { NextRequest, NextResponse } from "next/server";
import { getOrderBook } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderBook = await getOrderBook.execute(id);
    return NextResponse.json(orderBook, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to get order book") },
      { status: 400 }
    );
  }
}
