import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendMessage } from "@/config/usecases";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
} from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { conversationId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const messages = await getConversationMessages.execute({
      conversationId,
      userId,
      token,
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to fetch messages") },
      {
        status:
          getErrorCode(error as ErrorPayload) === "FORBIDDEN"
            ? ErrorCode.FORBIDDEN
            : ErrorCode.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { conversationId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const message = await sendMessage.execute({
      conversationId,
      senderId: userId,
      ...body,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to send message") },
      { status: 400 }
    );
  }
}
