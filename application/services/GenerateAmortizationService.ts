import { AmortizationRow } from "@domain/types/AmortizationRow";


export interface GenerateAmortizationService {
  generate(
    amountBorrowed: number,
    annualRate: number,
    insuranceRate: number,
    durationInMonths: number,
    startDate: Date
  ): AmortizationRow[];
}