import { NextRequest, NextResponse } from "next/server";
import { createTransfer } from "@/config/usecases";

export async function POST(request: NextRequest) {
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
    const transfer = await createTransfer.execute(body);

    return NextResponse.json(transfer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create transfer" },
      { status: 400 }
    );
  }
}
