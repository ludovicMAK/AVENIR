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
