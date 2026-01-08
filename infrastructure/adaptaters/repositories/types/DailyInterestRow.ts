export type DailyInterestRow = {
  id: string;
  date: Date;
  calculation_base: number;
  applied_rate: number;
  calculated_interest: number;
  credit_mode: string;
  account_id: string;
  transaction_id: string | null;
};
