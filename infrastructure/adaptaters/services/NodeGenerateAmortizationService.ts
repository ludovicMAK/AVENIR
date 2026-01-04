import { GenerateAmortizationService, AmortizationRow } from "@application/services/GenerateAmortizationService";

export class NodeGenerateAmortizationService implements GenerateAmortizationService {
  generate(
    amountBorrowed: number,
    annualRate: number,
    insuranceRate: number,
    durationInMonths: number,
    startDate: Date
  ): AmortizationRow[] {
    const monthlyRate = (annualRate / 100) / 12;
    
    const totalInsuranceCents = Math.round(amountBorrowed * (insuranceRate / 100));
    const monthlyInsuranceBase = Math.floor(totalInsuranceCents / durationInMonths);

    const monthlyBasePayment = Math.round(
      (amountBorrowed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationInMonths))
    );

    const schedule: AmortizationRow[] = [];
    let remainingPrincipal = amountBorrowed;
    let accumulatedInsurance = 0; 

    for (let month = 1; month <= durationInMonths; month++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month);

      const interestPart = Math.round(remainingPrincipal * monthlyRate);
      let principalPart: number;
      let currentInsurance: number;

      if (month === durationInMonths) {
        principalPart = remainingPrincipal;
        currentInsurance = totalInsuranceCents - accumulatedInsurance;
      } else {
        principalPart = monthlyBasePayment - interestPart;
        currentInsurance = monthlyInsuranceBase;
        accumulatedInsurance += currentInsurance;
      }

      schedule.push({
        dueDate,
        totalAmount: principalPart + interestPart + currentInsurance,
        shareInterest: interestPart,
        shareInsurance: currentInsurance,
        repaymentPortion: principalPart,
      });

      remainingPrincipal -= principalPart;
    }

    return schedule;
  }
}