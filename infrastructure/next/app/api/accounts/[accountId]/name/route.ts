import { NextRequest, NextResponse } from "next/server";
import { updateNameAccount } from "@/config/usecases";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { accountId: string } }
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
      idAccount: params.accountId,
      newAccountName: body.newName,
      token,
      idOwner: userId,
    });

    return NextResponse.json(
      { message: "Account name updated" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update account name" },
      { status: 400 }
    );
  }
}
