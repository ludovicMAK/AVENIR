import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/config/usecases";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await registerUser.execute(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: error.code === "CONFLICT" ? 409 : 400 }
    );
  }
}
