import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/config/usecases";

export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers.execute();

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
