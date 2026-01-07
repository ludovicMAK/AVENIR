import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/config/usecases";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await loginUser.execute(body);

    return NextResponse.json(session, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: error.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }
}
