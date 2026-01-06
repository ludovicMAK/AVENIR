import { NextRequest, NextResponse } from "next/server";
import { getAdvisorConversations } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { advisorId: string } }
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

    const conversations = await getAdvisorConversations.execute({
      advisorId: params.advisorId,
      token,
    });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
