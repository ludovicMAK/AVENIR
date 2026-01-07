export type DueDateRow = {
  id: string;
  due_date: Date;
  total_amount: number;
  share_interest: number;
  share_insurance: number;
  repayment_portion: number;
  status: string;
  credit_id: string;
  payment_date: Date | null;
  transfer_id: string | null;
  created_at: Date;
  updated_at: Date;
};
