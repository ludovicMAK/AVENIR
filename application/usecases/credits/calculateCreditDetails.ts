import { CalculateCreditDetailsRequest } from "@application/requests/credit";

export type CreditDetails = {
  monthlyPayment: number; 
  totalRepayment: number; 
  totalInterest: number; 
  totalInsurance: number; 
};

export class CalculateCreditDetails {
  execute(request: CalculateCreditDetailsRequest): CreditDetails {
    const monthlyRate = request.annualRate / 100 / 12;
    const insuranceMonthlyAmount =
      (request.insuranceRate / 100) * request.amountBorrowed / request.durationInMonths;

    const monthlyPaymentWithoutInsurance =
      (request.amountBorrowed * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -request.durationInMonths));

    const monthlyPayment = monthlyPaymentWithoutInsurance + insuranceMonthlyAmount;
    const totalRepayment = monthlyPayment * request.durationInMonths;
    const totalInterest = monthlyPaymentWithoutInsurance * request.durationInMonths - request.amountBorrowed;
    const totalInsurance = insuranceMonthlyAmount * request.durationInMonths;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      totalInterest: Math.round(totalInterest),
      totalInsurance: Math.round(totalInsurance),
    };
  }
}
