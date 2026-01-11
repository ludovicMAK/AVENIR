import { NextRequest, NextResponse } from "next/server";
import { getAccountsFromOwnerId, createAccount } from "@/config/usecases";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import {
  ErrorPayload,
  getErrorCode,
  getErrorMessage,
  getStatusCodeFromError,
} from "@/lib/api/errors";

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
    const serializedAccounts = accounts.map(account => ({
      id: account.id,
      accountType: typeof account.accountType?.getValue === 'function' ? String(account.accountType.getValue()) : String(account.accountType),
      IBAN: account.IBAN,
      accountName: account.accountName,
      authorizedOverdraft: account.authorizedOverdraft,
      overdraftLimit: account.overdraftLimit,
      overdraftFees: account.overdraftFees,
      status: typeof account.status?.getValue === 'function' ? String(account.status.getValue()) : String(account.status),
      idOwner: account.idOwner,
      balance: account.balance,
      availableBalance: account.availableBalance
    }));
    return createSuccessResponse(
      { accounts: serializedAccounts },
      {
        code: "ACCOUNTS_RETRIEVED",
        status: 200,
      }
    );
  } catch (error) {
    return createErrorResponse({
      code: getErrorCode(error as ErrorPayload) ?? "FETCH_ACCOUNTS_FAILED",
      message: getErrorMessage(error as ErrorPayload, "Failed to fetch accounts"),
      status: getStatusCodeFromError(error as ErrorPayload),
      error: error as ErrorPayload | undefined,
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
    const serializedAccount = {
      id: account.id,
      accountType: typeof account.accountType?.getValue === 'function' ? String(account.accountType.getValue()) : String(account.accountType),
      IBAN: account.IBAN,
      accountName: account.accountName,
      authorizedOverdraft: account.authorizedOverdraft,
      overdraftLimit: account.overdraftLimit,
      overdraftFees: account.overdraftFees,
      status: typeof account.status?.getValue === 'function' ? String(account.status.getValue()) : String(account.status),
      idOwner: account.idOwner,
      balance: account.balance,
      availableBalance: account.availableBalance
    };
    return createSuccessResponse(
      { account: serializedAccount },
      {
        code: "ACCOUNT_CREATED",
        message: "Account created successfully",
        status: 201,
      }
    );
  } catch (error) {
    return createErrorResponse({
      code: getErrorCode(error as ErrorPayload) ?? "CREATE_ACCOUNT_FAILED",
      message: getErrorMessage(error as ErrorPayload, "Failed to create account"),
      status: getStatusCodeFromError(error as ErrorPayload),
      error: error as ErrorPayload | undefined,
    });
  }
}
