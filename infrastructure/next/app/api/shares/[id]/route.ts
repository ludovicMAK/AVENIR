import { NextRequest, NextResponse } from "next/server";
import { getShareById } from "@/config/usecases";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
} from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const share = await getShareById.execute({ shareId: id });
    return NextResponse.json(share, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Share not found") },
      {
        status:
          getErrorCode(error as ErrorPayload) === "NOT_FOUND"
            ? ErrorCode.NOT_FOUND
            : ErrorCode.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
