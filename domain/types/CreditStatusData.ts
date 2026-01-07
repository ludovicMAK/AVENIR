export type CreditStatusData = {
  credit: {
    id: string;
    amountBorrowed: number;
    annualRate: number;
    insuranceRate: number;
    durationInMonths: number;
    startDate: Date;
    status: string;
    customerId: string;
  };
  progress: {
    totalDueDates: number;
    paidDueDates: number;
    remainingDueDates: number;
    totalAmountToPay: number;
    totalAmountPaid: number;
    totalAmountRemaining: number;
    percentageCompleted: number;
  };
  nextDueDate?: {
    id: string;
    dueDate: Date;
    totalAmount: number;
    status: string;
    daysUntilDue: number;
  };
  overdueDueDates: Array<{
    id: string;
    dueDate: Date;
    totalAmount: number;
    daysOverdue: number;
  }>;
};
