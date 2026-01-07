import { DueDateStatus } from "@domain/values/dueDateStatus";

export class DueDate {
  constructor(
    readonly id: string,
    readonly dueDate: Date,
    readonly totalAmount: number, 
    readonly shareInterest: number, 
    readonly shareInsurance: number, 
    readonly repaymentPortion: number, 
    readonly status: DueDateStatus,
    readonly creditId: string,
    readonly paymentDate?: Date,
    readonly transferId?: string
  ) {}

  isPayable(): boolean {
    return this.status.equals(DueDateStatus.PAYABLE);
  }

  isPaid(): boolean {
    return this.status.equals(DueDateStatus.PAID);
  }

  isOverdue(): boolean {
    return this.status.equals(DueDateStatus.OVERDUE);
  }

  canBePaid(): boolean {
    return this.status.equals(DueDateStatus.PAYABLE) || this.status.equals(DueDateStatus.OVERDUE);
  }


  isOverdueNow(): boolean {
    const now = new Date();
    return this.status.equals(DueDateStatus.PAYABLE) && this.dueDate < now;
  }

  hasTransfer(): boolean {
    return this.transferId !== undefined;
  }

  getDaysUntilDue(): number {
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(): number {
    if (!this.isOverdue() && !this.isOverdueNow()) {
      return 0;
    }
    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
