import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";

export type TransferStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface Transfer {
  id: string;
  amount: number;
  dateRequested: string;
  dateExecuted?: string;
  description: string;
  status: string;
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

const parseTransfer = (data: JsonObject): Transfer => ({
  id: String(data.id),
  amount: Number(data.amount),
  dateRequested: String(data.dateRequested),
  dateExecuted:
    data.dateExecuted !== undefined && data.dateExecuted !== null
      ? String(data.dateExecuted)
      : undefined,
  description: String(data.description),
  status: String(data.status),
});

export const transfersApi = {
  async create(data: CreateTransferRequest) {
    const response = await request(`/transaction`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  async getHistory() {
    const response = await request<JsonValue>(`/transfers/history`, {
      method: "GET",
    });

    if (!Array.isArray(response)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid transfer history response"
      );
    }

    const transfers = response.filter(isJsonObject);
    return { transactions: transfers.map(parseTransfer) };
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
