import { NextRequest, NextResponse } from "next/server";
import { getShareById } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const share = await getShareById.execute({ shareId: params.id });
    return NextResponse.json(share, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Share not found" },
      { status: error.code === "NOT_FOUND" ? 404 : 500 }
    );
  }
}
