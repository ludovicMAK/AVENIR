export type PaymentHistoryItem = {
  id: string;
  dueDate: Date;
  paymentDate: Date;
  totalAmount: number;
  shareInterest: number;
  shareInsurance: number;
  repaymentPortion: number;
  transferId: string;
};
