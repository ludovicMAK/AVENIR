export type AccountRow = {
  id: string;
  iban: string;
  account_type: string;
  account_name: string;
  authorized_overdraft: boolean;
  overdraft_limit: number;
  overdraft_fees: number;
  status: string;
  balance: number;
  id_owner: string;
  available_balance: number;
};
