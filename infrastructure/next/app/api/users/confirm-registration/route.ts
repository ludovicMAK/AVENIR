import { NextRequest, NextResponse } from "next/server";
import { confirmRegistration } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await confirmRegistration.execute(token);

    return NextResponse.json(
      { message: "Registration confirmed" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Confirmation failed") },
      { status: 400 }
    );
  }
}
