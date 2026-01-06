import { NextRequest, NextResponse } from "next/server";
import { getClientPositions } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const positions = await getClientPositions.execute({
      customerId: params.customerId,
    });

    return NextResponse.json(positions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get positions" },
      { status: 500 }
    );
  }
}
