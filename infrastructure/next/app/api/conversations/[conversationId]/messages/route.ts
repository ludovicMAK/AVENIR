import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendMessage } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
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

    const messages = await getConversationMessages.execute({
      conversationId: params.conversationId,
      userId,
      token,
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: error.code === "FORBIDDEN" ? 403 : 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
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
    const message = await sendMessage.execute({
      conversationId: params.conversationId,
      senderId: userId,
      ...body,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 400 }
    );
  }
}
