import { NextRequest, NextResponse } from "next/server";
import { transferConversation } from "@/config/usecases";

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
    const conversation = await transferConversation.execute({
      token,
      conversationId: body.conversationId,
      fromAdvisorId: body.fromAdvisorId,
      toAdvisorId: body.toAdvisorId,
      reason: body.reason,
    });

    return NextResponse.json(conversation, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to transfer conversation" },
      { status: 400 }
    );
  }
}
