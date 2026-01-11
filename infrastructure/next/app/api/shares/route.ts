import { NextRequest, NextResponse } from "next/server";
import { createShare, getAllShares } from "@/config/usecases";
import { ErrorPayload, getErrorMessage } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const share = await createShare.execute(body);

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to create share") },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const shares = await getAllShares.execute();
    return NextResponse.json(shares, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to fetch shares") },
      { status: 500 }
    );
  }
}
