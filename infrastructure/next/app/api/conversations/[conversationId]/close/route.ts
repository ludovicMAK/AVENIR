import { NextRequest, NextResponse } from "next/server";
import { closeConversation } from "@/config/usecases";

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

    await closeConversation.execute({
      conversationId: params.conversationId,
      token,
      userId,
    });

    return NextResponse.json(
      { message: "Conversation closed" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to close conversation" },
      { status: 400 }
    );
  }
}
