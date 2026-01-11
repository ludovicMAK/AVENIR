import { NextRequest, NextResponse } from "next/server";
import { closeConversation } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

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

    await closeConversation.execute({
      conversationId,
      token,
      userId,
    });

    return NextResponse.json(
      { message: "Conversation closed" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to close conversation") },
      { status: 400 }
    );
  }
}
