import { NextRequest, NextResponse } from "next/server";
import {
  getAccountById,
  closeOwnAccount,
  updateNameAccount,
} from "@/config/usecases";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await getAccountById.execute({ id: params.id });
    return NextResponse.json(account, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Account not found" },
      { status: error.code === "NOT_FOUND" ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await closeOwnAccount.execute({
      idAccount: params.id,
      token,
      userId,
    });
    return NextResponse.json({ message: "Account closed" }, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to close account" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    await updateNameAccount.execute({
      idAccount: params.id,
      newAccountName: body.newName,
      token,
      idOwner: userId,
    });

    return NextResponse.json({ message: "Account updated" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update account" },
      { status: 400 }
    );
  }
}
