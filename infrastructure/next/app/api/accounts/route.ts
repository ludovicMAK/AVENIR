import { NextRequest, NextResponse } from "next/server";
import { getAccountsFromOwnerId, createAccount } from "@/config/usecases";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return createErrorResponse({
        code: "MISSING_OWNER_ID",
        message: "ownerId is required",
        status: 400,
      });
    }

    const accounts = await getAccountsFromOwnerId.execute({ id: ownerId });
    return createSuccessResponse(
      { accounts },
      {
        code: "ACCOUNTS_RETRIEVED",
        status: 200,
      }
    );
  } catch (error: any) {
    return createErrorResponse({
      code: error.code || "FETCH_ACCOUNTS_FAILED",
      message: error.message || "Failed to fetch accounts",
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!userId || !token) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        status: 401,
      });
    }

    const body = await request.json();
    const account = await createAccount.execute(body);

    return createSuccessResponse(
      { account },
      {
        code: "ACCOUNT_CREATED",
        message: "Account created successfully",
        status: 201,
      }
    );
  } catch (error: any) {
    return createErrorResponse({
      code: error.code || "CREATE_ACCOUNT_FAILED",
      message: error.message || "Failed to create account",
      status: 400,
    });
  }
}
