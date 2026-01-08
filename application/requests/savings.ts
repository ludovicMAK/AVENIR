import { Role } from "@domain/values/role";

export type UpdateSavingsRateRequest = {
  rate: number;
  dateEffect?: string;
  actorRole: Role;
};

export type GetSavingsRateHistoryRequest = Record<string, never>;

export type GetActiveSavingsRateRequest = {
  date?: string;
};

export type ProcessDailySavingsInterestRequest = {
  date?: string;
  actorRole: Role;
};

export type GetAccountInterestHistoryRequest = {
  userId: string;
  accountId: string;
  from?: string;
  to?: string;
};
