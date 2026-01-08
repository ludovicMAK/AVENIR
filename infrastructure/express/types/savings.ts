export type SavingsRateDto = {
  id: string;
  rate: number;
  dateEffect: string;
};

export type DailyInterestDto = {
  id: string;
  date: string;
  calculationBase: number;
  appliedRate: number;
  calculatedInterest: number;
  creditMode: string;
  accountId: string;
  transactionId: string | null;
};
