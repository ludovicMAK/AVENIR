export type SavingsRate = {
  id: string;
  rate: number;
  dateEffect: string;
};

export type DailyInterest = {
  id: string;
  date: string;
  calculationBase: number;
  appliedRate: number;
  calculatedInterest: number;
  creditMode: string;
  accountId: string;
  transactionId: string | null;
};

export type ProcessDailyInterestResult = {
  date: string;
  processedAccounts: number;
  skippedAccounts: number;
};
