import { AmortizationRow } from "./AmortizationRow";

export type AmortizationSchedule = {
  schedule: AmortizationRow[];
  summary: {
    monthlyPayment: number;
    totalRepayment: number;
    totalInterest: number;
    totalInsurance: number;
  };
};
