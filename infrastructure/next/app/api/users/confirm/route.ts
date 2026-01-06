import { NextRequest, NextResponse } from "next/server";
import { confirmRegistration } from "@/config/usecases";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await confirmRegistration.execute(body);

    return NextResponse.json(
      { message: "Registration confirmed" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Confirmation failed" },
      { status: 400 }
    );
  }
}
