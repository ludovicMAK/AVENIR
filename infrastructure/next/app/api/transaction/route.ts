import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/config/usecases";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      description,
      amount,
      accountIBANFrom,
      accountIBANTo,
      direction,
      dateExecuted,
    } = body;

    if (
      !description ||
      !amount ||
      !accountIBANFrom ||
      !accountIBANTo ||
      !dateExecuted
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await createTransaction.execute({
      idUser: userId,
      token,
      description,
      amount,
      accountIBANFrom,
      accountIBANTo,
      direction: direction || "debit",
      dateExecuted: new Date(dateExecuted),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/transaction] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 400 }
    );
  }
}
