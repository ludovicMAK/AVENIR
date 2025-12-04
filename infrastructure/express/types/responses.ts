export type UserView = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
};

export type AccountView = {
  id: string;
  IBAN: string;
  accountType: string;
  accountName: string;
  authorizedOverdraft: boolean;
  overdraftLimit: number;
  overdraftFees: number;
  status: string;
  balance: number;
  idOwner: string;
};

export type AccountResponseData = { accounts: AccountView[] };

export type SingleAccountResponseData = { account: AccountView };

export type UserResponseData = { user: UserView };

export type UserListResponseData = { users: UserView[] };

export type SuccessData =
  | UserResponseData
  | UserListResponseData
  | AccountResponseData
  | SingleAccountResponseData
  | undefined;

export type SuccessPayload<ResponseData extends SuccessData = SuccessData> = {
  ok: true;
  code: string;
  message?: string;
  data?: ResponseData;
};

export type SuccessOptions<ResponseData extends SuccessData = SuccessData> = {
  status?: number;
  code: string;
  message?: string;
  data?: ResponseData;
  headers?: Record<string, string>;
};
