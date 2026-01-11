import { NextRequest, NextResponse } from "next/server";
import {
  getAccountById,
  closeOwnAccount,
  updateNameAccount,
} from "@/config/usecases";
import {
  ErrorCode,
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
} from "@/lib/api/errors";

type AccountParamsContext = { params: Promise<{ id: string }> };

async function resolveAccountId(context: AccountParamsContext) {
  const { id } = await context.params;
  return id;
}

export async function GET(
  request: NextRequest,
  context: AccountParamsContext
) {
  const id = await resolveAccountId(context);

  try {
    const account = await getAccountById.execute({ id });
    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Account not found") },
      {
        status:
          getErrorCode(error as ErrorPayload) === "NOT_FOUND"
            ? ErrorCode.NOT_FOUND
            : ErrorCode.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: AccountParamsContext
) {
  const id = await resolveAccountId(context);

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
      idAccount: id,
      token,
      userId,
    });
    return NextResponse.json({ message: "Account closed" }, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to close account") },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: AccountParamsContext
) {
  const id = await resolveAccountId(context);

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
      idAccount: id,
      newAccountName: body.newName,
      token,
      idOwner: userId,
    });

    return NextResponse.json({ message: "Account updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error as ErrorPayload, "Failed to update account") },
      { status: 400 }
    );
  }
}
