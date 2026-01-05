export type GrantCreditRequest = {
  token: string;
  customerId: string;
  amountBorrowed: number; 
  annualRate: number; 
  insuranceRate: number; 
  durationInMonths: number;
  advisorId: string;
};

export type GetCreditByIdRequest = {
  creditId: string;
  token: string;
};

export type GetCustomerCreditsRequest = {
  customerId: string;
  token: string;
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
