import { NextRequest, NextResponse } from "next/server";
import { confirmRegistration } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await confirmRegistration.execute(body);

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
