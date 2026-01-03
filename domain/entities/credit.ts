import { CreditStatus } from "@domain/values/creditStatus";

export class Credit {
  constructor(
    readonly id: string,
    readonly amountBorrowed: number, 
    readonly annualRate: number, 
    readonly insuranceRate: number, 
    readonly durationInMonths: number,
    readonly startDate: Date,
    readonly status: CreditStatus,
    readonly customerId: string
  ) {}

  isInProgress(): boolean {
    return this.status.equals(CreditStatus.IN_PROGRESS);
  }

  isCompleted(): boolean {
    return this.status.equals(CreditStatus.COMPLETED);
  }

  canBeCompleted(): boolean {
    return this.status.equals(CreditStatus.IN_PROGRESS);
  }

  getTotalAmountToPay(): number {
    const totalInterests = this.amountBorrowed * (this.annualRate / 100) * (this.durationInMonths / 12);
    const totalInsurance = this.amountBorrowed * (this.insuranceRate / 100) * (this.durationInMonths / 12);
    return this.amountBorrowed + totalInterests + totalInsurance;
  }

  getMonthlyPayment(): number {
    return Math.ceil(this.getTotalAmountToPay() / this.durationInMonths);
  }

  calculateMonthlyPayment(): number {
    const monthlyRate = this.annualRate / 100 / 12;
    const insuranceAmount = (this.insuranceRate / 100) * this.amountBorrowed / 12;
    const monthlyPayment = (this.amountBorrowed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -this.durationInMonths));
    return monthlyPayment + insuranceAmount;
  }

  calculateTotalRepayment(): number {
    return this.calculateMonthlyPayment() * this.durationInMonths;
  }

  calculateRemainingBalance(monthsPaid: number): number {
    const monthlyPayment = this.calculateMonthlyPayment();
    return this.amountBorrowed - (monthlyPayment * monthsPaid);
  }
}
