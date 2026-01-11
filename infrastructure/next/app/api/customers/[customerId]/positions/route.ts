import { NextRequest, NextResponse } from "next/server";
import { getClientPositions } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { customerId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const positions = await getClientPositions.execute({
      customerId,
    });

    return NextResponse.json(positions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to get positions") },
      { status: 500 }
    );
  }
}
