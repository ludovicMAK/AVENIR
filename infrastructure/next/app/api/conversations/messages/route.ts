import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/config/usecases";

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
    const message = await sendMessage.execute({
      token,
      conversationId: body.conversationId,
      senderId: userId,
      text: body.text,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 400 }
    );
  }
}
