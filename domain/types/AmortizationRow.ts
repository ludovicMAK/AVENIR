export interface AmortizationRow {
  dueDate: Date;
  totalAmount: number;
  shareInterest: number;
  shareInsurance: number;
  repaymentPortion: number;
}