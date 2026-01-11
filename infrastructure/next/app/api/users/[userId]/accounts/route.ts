import { NextRequest, NextResponse } from "next/server";
import { getAccountsFromOwnerId } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const accounts = await getAccountsFromOwnerId.execute({
      id: userId,
    });
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to fetch accounts") },
      { status: 500 }
    );
  }
}
