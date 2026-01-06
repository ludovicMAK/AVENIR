import { NextRequest, NextResponse } from "next/server";
import { calculateSharePrice } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const priceCalculation = await calculateSharePrice.execute(params.id);
    return NextResponse.json(priceCalculation, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to calculate price" },
      { status: 400 }
    );
  }
}
