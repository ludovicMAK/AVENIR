import { NextRequest, NextResponse } from "next/server";
import { validateTransferByAdmin } from "@/config/usecases";

export async function POST(
  request: NextRequest,
  { params }: { params: { transferId: string } }
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
    await validateTransferByAdmin.execute({
      userId,
      token,
      idTransfer: params.transferId,
    });

    return NextResponse.json(
      { message: "Transfer validated" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate transfer" },
      { status: 400 }
    );
  }
}
