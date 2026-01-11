import { NextRequest, NextResponse } from "next/server";
import { calculateSharePrice } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const priceCalculation = await calculateSharePrice.execute(id);
    return NextResponse.json(priceCalculation, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to calculate price") },
      { status: 400 }
    );
  }
}
