export type ownerIdInput = {
  id: string;
};
export type CreateAccountRequest = {
  token: string;
  accountType: string;
  accountName: string;
  authorizedOverdraft: boolean;
  overdraftLimit: number;
  overdraftFees: number;
  idOwner: string;
};
export type CloseOwnAccountRequest = {
  idAccount: string;
  token: string;
  userId: string;
};
export type UpdateNameAccountRequest = {
  idAccount: string;
  newAccountName: string;
  token: string;
  idOwner: string;
};

export type GetAccountBalanceRequest = {
  accountId: string;
  userId: string;
  token: string;
};

export type GetAccountTransactionsRequest = {
  accountId: string;
  userId: string;
  token: string;
  startDate?: string; // ISO date
  endDate?: string;
  direction?: string; // DEBIT or CREDIT
  status?: string;
  page?: number;
  limit?: number;
};

export type GetAccountStatementRequest = {
  accountId: string;
  userId: string;
  token: string;
  fromDate: string; // ISO date (required)
  toDate: string; // ISO date (required)
};
