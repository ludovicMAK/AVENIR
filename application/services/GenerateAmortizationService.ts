export interface AmortizationRow {
  dueDate: Date;
  totalAmount: number;
  shareInterest: number;
  shareInsurance: number;
  repaymentPortion: number;
}

export interface GenerateAmortizationService {
  generate(
    amountBorrowed: number,
    annualRate: number,
    insuranceRate: number,
    durationInMonths: number,
    startDate: Date
  ): AmortizationRow[];
}