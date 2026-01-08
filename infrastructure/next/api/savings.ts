import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonValue } from "@/types/json";
import {
  DailyInterest,
  ProcessDailyInterestResult,
  SavingsRate,
} from "@/types/savings";

const invalidSavingsResponseError = () =>
  new ApiError(
    "INFRASTRUCTURE_ERROR",
    "Invalid savings payload received from API."
  );

const toSavingsRate = (value: JsonValue): SavingsRate => {
  if (!isJsonObject(value)) throw invalidSavingsResponseError();
  const { id, rate, dateEffect } = value;
  if (
    typeof id !== "string" ||
    typeof rate !== "number" ||
    typeof dateEffect !== "string"
  ) {
    throw invalidSavingsResponseError();
  }
  return { id, rate, dateEffect };
};

const toDailyInterest = (value: JsonValue): DailyInterest => {
  if (!isJsonObject(value)) throw invalidSavingsResponseError();
  const {
    id,
    date,
    calculationBase,
    appliedRate,
    calculatedInterest,
    creditMode,
    accountId,
    transactionId,
  } = value;

  if (
    typeof id !== "string" ||
    typeof date !== "string" ||
    typeof calculationBase !== "number" ||
    typeof appliedRate !== "number" ||
    typeof calculatedInterest !== "number" ||
    typeof creditMode !== "string" ||
    typeof accountId !== "string" ||
    (transactionId !== null && typeof transactionId !== "string")
  ) {
    throw invalidSavingsResponseError();
  }

  return {
    id,
    date,
    calculationBase,
    appliedRate,
    calculatedInterest,
    creditMode,
    accountId,
    transactionId,
  };
};

export const savingsApi = {
  async getActiveRate(params?: { date?: string }): Promise<SavingsRate> {
    const query = params?.date ? `?date=${encodeURIComponent(params.date)}` : "";
    const response = await request(`/savings/rates/active${query}`);
    if (!isJsonObject(response) || !isJsonObject(response.rate)) {
      throw invalidSavingsResponseError();
    }
    return toSavingsRate(response.rate);
  },

  async getHistory(): Promise<SavingsRate[]> {
    const response = await request(`/savings/rates/history`);
    if (!isJsonObject(response) || !Array.isArray(response.rates)) {
      throw invalidSavingsResponseError();
    }
    return response.rates.map(toSavingsRate);
  },

  async updateRate(input: {
    rate: number;
    dateEffect?: string;
  }): Promise<SavingsRate> {
    const response = await request(`/savings/rates`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!isJsonObject(response) || !isJsonObject(response.rate)) {
      throw invalidSavingsResponseError();
    }
    return toSavingsRate(response.rate);
  },

  async processDailyInterest(input: {
    date?: string;
  }): Promise<ProcessDailyInterestResult> {
    const response = await request(`/savings/interests/process`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (
      !isJsonObject(response) ||
      typeof response.date !== "string" ||
      typeof response.processedAccounts !== "number" ||
      typeof response.skippedAccounts !== "number"
    ) {
      throw invalidSavingsResponseError();
    }

    return {
      date: response.date,
      processedAccounts: response.processedAccounts,
      skippedAccounts: response.skippedAccounts,
    };
  },

  async getAccountInterestHistory(
    accountId: string,
    params?: { from?: string; to?: string }
  ): Promise<DailyInterest[]> {
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.set("from", params.from);
    if (params?.to) queryParams.set("to", params.to);
    const query = queryParams.toString();
    const url = query
      ? `/accounts/${accountId}/interests?${query}`
      : `/accounts/${accountId}/interests`;

    const response = await request(url);
    if (!isJsonObject(response) || !Array.isArray(response.interests)) {
      throw invalidSavingsResponseError();
    }

    return response.interests.map(toDailyInterest);
  },
};
