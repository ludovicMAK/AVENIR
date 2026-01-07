export type GrantCreditRequest = {
  token: string;
  customerId: string;
  accountId: string;
  amountBorrowed: number; 
  annualRate: number; 
  insuranceRate: number; 
  durationInMonths: number;
  advisorId: string;
};

export type CalculateCreditDetailsRequest = {
  amountBorrowed: number; 
  annualRate: number; 
  insuranceRate: number; 
  durationInMonths: number;
};

export type PayInstallmentRequest = {
  token: string;
  customerId: string;
  dueDateId: string;
};

export type GetCustomerCreditsWithDueDatesRequest = {
  customerId: string;
  token: string;
  advisorId: string;
};

export type GetMyCreditsRequest = {
  customerId: string;
  token: string;
};

export type GetCreditStatusRequest = {
  creditId: string;
  userId: string;
  token: string;
};

export type GetPaymentHistoryRequest = {
  creditId: string;
  userId: string;
  token: string;
};

export type EarlyRepaymentRequest = {
  creditId: string;
  customerId: string;
  token: string;
};

export type MarkOverdueRequest = {
  token: string;
  userId: string;
};

export type GetOverdueDueDatesRequest = {
  token: string;
  userId: string;
};
