import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers.execute();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to fetch users") },
      { status: 500 }
    );
  }
}
