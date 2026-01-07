import { NextRequest, NextResponse } from "next/server";
import { addParticipant } from "@/config/usecases";

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
    const participant = await addParticipant.execute({
      conversationId: params.conversationId,
      ...body,
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add participant" },
      { status: 400 }
    );
  }
}
