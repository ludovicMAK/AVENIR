import { NextRequest, NextResponse } from "next/server";
import { closeConversation } from "@/config/usecases";
import {
  ErrorPayload,
  getErrorCode,
  getStatusCodeFromError,
} from "@/lib/api/errors";

async function handleClose(
  request: NextRequest,
  params: Promise<{ conversationId: string }>
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { conversationId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await closeConversation.execute({
      conversationId,
      token,
      userId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const payload: ErrorPayload = error as ErrorPayload;
    const statusCode = getStatusCodeFromError(payload);
    const code = getErrorCode(payload);

    return NextResponse.json(
      { ok: false, code },
      { status: statusCode }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return handleClose(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return handleClose(request, params);
}
