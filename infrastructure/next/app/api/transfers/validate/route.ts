import { NextRequest, NextResponse } from "next/server";
import { validateTransferByAdmin } from "@/config/usecases";

export async function PATCH(request: NextRequest) {
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
    const transfer = await validateTransferByAdmin.execute({
      userId,
      token,
      idTransfer: body.transferId,
    });

    return NextResponse.json(transfer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate transfer" },
      { status: 400 }
    );
  }
}
