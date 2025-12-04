export type AccountRow = {
  id: string;
  IBAN: string;
  account_type: string;
  account_name: string;
  authorized_overdraft: boolean;
  overdraft_limit: number;
  overdraft_fees: number;
  status: string;
  balance: number;
  id_owner: string;
};
