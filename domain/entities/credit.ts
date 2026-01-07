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


  getMonthlyPayment(): number {
    const monthlyRate = (this.annualRate / 100) / 12;
    
    const capitalAndInterest = (this.amountBorrowed * monthlyRate) / 
                               (1 - Math.pow(1 + monthlyRate, -this.durationInMonths));

    const monthlyInsurance = (this.amountBorrowed * (this.insuranceRate / 100)) / 12;

    return Number((capitalAndInterest + monthlyInsurance).toFixed(2));
  }


  getTotalAmountToPay(): number {
    return Number((this.getMonthlyPayment() * this.durationInMonths).toFixed(2));
  }


  getLoanCost(): number {
    return Number((this.getTotalAmountToPay() - this.amountBorrowed).toFixed(2));
  }
}