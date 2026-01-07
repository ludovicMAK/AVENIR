export type CreditRow = {
  id: string;
  amount_borrowed: number;
  annual_rate: number;
  insurance_rate: number;
  duration_in_months: number;
  start_date: Date;
  status: string;
  customer_id: string;
  created_at: Date;
  updated_at: Date;
};
