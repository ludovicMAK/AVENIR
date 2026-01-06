import { NextRequest, NextResponse } from "next/server";
import { cancelOrder } from "@/config/usecases";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
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

    const body = await request.json();
    await cancelOrder.execute({
      orderId: params.orderId,
      customerId: body.customerId,
    });

    return NextResponse.json({ message: "Order cancelled" }, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 400 }
    );
  }
}
