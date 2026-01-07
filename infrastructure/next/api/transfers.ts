import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonValue } from "@/types/json";

export type TransferStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface Transfer {
  id: string;
  accountIBAN: string;
  transactionDirection: string;
  amount: number;
  reason: string;
  accountDate: string;
  status: string;
  transferId?: string;
  counterpartyIBAN?: string;
}

export interface CreateTransferRequest {
  accountIBANFrom: string;
  accountIBANTo: string;
  amount: number;
  dateExecuted: string;
  description: string;
  direction?: "debit" | "credit";
}

const invalidTransferResponseError = () =>
  new ApiError(
    "INFRASTRUCTURE_ERROR",
    "Invalid transfer payload received from API."
  );

export const transfersApi = {
  async create(data: CreateTransferRequest) {
    const response = await request(`/transaction`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  async getHistory() {
    const response = await request(`/transactions/history`, {
      method: "GET",
    });
    console.log(
      "[transfersApi.getHistory] Response:",
      JSON.stringify(response, null, 2)
    );
    if (!isJsonObject(response) || !Array.isArray(response.transactions)) {
      console.error(
        "[transfersApi.getHistory] Invalid response structure:",
        response
      );
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid transaction history response"
      );
    }
    return response as unknown as { transactions: Transfer[] };
  },

  async validate(transferId: string) {
    const response = await request(`/transfers/validate`, {
      method: "PATCH",
      body: JSON.stringify({ idTransfer: transferId }),
    });
    return response;
  },

  async cancel(transferId: string) {
    const response = await request(`/transfers/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ transferId }),
    });
    return response;
  },
};
