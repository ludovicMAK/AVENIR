import { NextRequest, NextResponse } from "next/server";
import { getAccountsFromOwnerId } from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const accounts = await getAccountsFromOwnerId.execute({
      id: params.userId,
    });
    return NextResponse.json(accounts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
