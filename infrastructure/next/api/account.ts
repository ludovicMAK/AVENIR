import { request } from "./client";
import {
  Account,
  AccountStatusValue,
  AccountTypeValue,
} from "@/types/accounts";
import { getCurrentUser } from "@/lib/users/server";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonValue } from "@/types/json";

type AccountsResponseBody = {
  data?: {
    accounts?: JsonValue;
  };
};

const invalidAccountsResponseError = () =>
  new ApiError(
    "INFRASTRUCTURE_ERROR",
    "Invalid accounts payload received from API."
  );

const toPrimitiveValue = (value: JsonValue): string | null => {
  if (typeof value === "string") return value;
  if (isJsonObject(value) && typeof value.value === "string") {
    return value.value;
  }
  return null;
};

const isAccountType = (value: string | null): value is AccountTypeValue =>
  value === "current" || value === "savings" || value === "trading";

const isAccountStatus = (value: string | null): value is AccountStatusValue =>
  value === "open" || value === "close";

const toAccount = (value: JsonValue): Account => {
  if (!isJsonObject(value)) throw invalidAccountsResponseError();

  const id = value.id;
  const accountName = value.accountName;
  const balance = value.balance;
  const idOwner = value.idOwner;
  const accountType = toPrimitiveValue(value.accountType);
  const status = toPrimitiveValue(value.status);
  const IBAN = value.IBAN;
  const authorizedOverdraft = value.authorizedOverdraft;
  const overdraftLimit = value.overdraftLimit;
  const overdraftFees = value.overdraftFees;

  if (
    typeof id !== "string" ||
    typeof accountName !== "string" ||
    typeof balance !== "number" ||
    typeof idOwner !== "string" ||
    !isAccountType(accountType)
  ) {
    throw invalidAccountsResponseError();
  }

  return {
    id,
    accountName,
    accountType,
    idOwner,
    balance,
    status: isAccountStatus(status) ? status : undefined,
    IBAN: typeof IBAN === "string" ? IBAN : undefined,
    authorizedOverdraft:
      typeof authorizedOverdraft === "boolean"
        ? authorizedOverdraft
        : undefined,
    overdraftLimit:
      typeof overdraftLimit === "number" ? overdraftLimit : undefined,
    overdraftFees:
      typeof overdraftFees === "number" ? overdraftFees : undefined,
  };
};

const extractAccounts = (response: JsonValue): Account[] => {
  if (!isJsonObject(response)) throw invalidAccountsResponseError();

  // Le client API retourne directement {accounts} après avoir extrait data
  const accountsJson = response.accounts;
  if (!Array.isArray(accountsJson)) throw invalidAccountsResponseError();

  return accountsJson.map(toAccount);
};

export const accountsApi = {
  async getAccountsByUserId(userId: string) {
    const response = await request(`/users/${userId}/accounts`);
    return extractAccounts(response);
  },

  async getByOwnerId(ownerId: string) {
    const response = await request(`/users/${ownerId}/accounts`);
    return extractAccounts(response);
  },

  async getById(accountId: string) {
    const response = await request(`/accounts/${accountId}`);
    if (!isJsonObject(response) || !isJsonObject(response.account)) {
      throw invalidAccountsResponseError();
    }
    return toAccount(response.account);
  },

  async create(data: {
    idOwner: string;
    accountType: AccountTypeValue;
    accountName: string;
    authorizedOverdraft?: boolean;
    overdraftLimit?: number;
    overdraftFees?: number;
  }) {
    const response = await request(`/accounts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.account)) {
      throw invalidAccountsResponseError();
    }
    return toAccount(response.account);
  },

  async updateName(accountId: string, accountName: string) {
    const response = await request(`/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify({ newName: accountName }),
    });
    // Le backend ne retourne que le message de succès, pas l'account
    return response;
  },

  async close(accountId: string) {
    await request(`/accounts/${accountId}`, {
      method: "DELETE",
    });
  },

  async getBalance(accountId: string) {
    const response = await request(`/accounts/${accountId}/balance`);
    if (!isJsonObject(response) || !isJsonObject(response.data)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid balance response");
    }
    return response.data as {
      accountId: string;
      balance: number;
      balanceAvailable: number;
      totalDebits: number;
      totalCredits: number;
      pendingTransactions: number;
    };
  },

  async getTransactions(
    accountId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      direction?: "debit" | "credit";
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.direction) queryParams.append("direction", params.direction);
    if (params?.minAmount)
      queryParams.append("minAmount", params.minAmount.toString());
    if (params?.maxAmount)
      queryParams.append("maxAmount", params.maxAmount.toString());

    const query = queryParams.toString();
    const url = query
      ? `/accounts/${accountId}/transactions?${query}`
      : `/accounts/${accountId}/transactions`;

    const response = await request(url);
    if (!isJsonObject(response) || !isJsonObject(response.data)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid transactions response"
      );
    }
    return response.data as {
      transactions: Array<{
        id: string;
        accountIBAN: string;
        transactionDirection: string;
        amount: number;
        reason: string;
        accountDate: string;
        status: string;
        transferId?: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  async getStatement(
    accountId: string,
    params: {
      startDate: string;
      endDate: string;
    }
  ) {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    const response = await request(
      `/accounts/${accountId}/statement?${queryParams.toString()}`
    );
    if (!isJsonObject(response) || !isJsonObject(response.data)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid statement response");
    }
    return response.data as {
      accountId: string;
      accountName: string;
      IBAN: string;
      period: {
        startDate: string;
        endDate: string;
      };
      openingBalance: number;
      closingBalance: number;
      totalDebits: number;
      totalCredits: number;
      transactions: Array<{
        id: string;
        date: string;
        description: string;
        direction: string;
        amount: number;
        balance: number;
      }>;
    };
  },
};
