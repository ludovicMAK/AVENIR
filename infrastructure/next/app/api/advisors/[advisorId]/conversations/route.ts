import { NextRequest, NextResponse } from "next/server";
import { getAdvisorConversations } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ advisorId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { advisorId } = await params;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const conversations = await getAdvisorConversations.execute({
      advisorId,
      token,
    });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to fetch conversations") },
      { status: 500 }
    );
  }
}
