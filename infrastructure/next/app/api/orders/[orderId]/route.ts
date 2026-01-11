import { NextRequest, NextResponse } from "next/server";
import { cancelOrder } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { orderId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    await cancelOrder.execute({
      orderId,
      customerId: body.customerId,
    });

    return NextResponse.json({ message: "Order cancelled" }, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to cancel order") },
      { status: 400 }
    );
  }
}
