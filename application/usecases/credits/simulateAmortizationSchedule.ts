import { GenerateAmortizationService } from "@application/services/GenerateAmortizationService";
import { CalculateCreditDetailsRequest } from "@application/requests/credit";
import { AmortizationSchedule } from "@domain/types/AmortizationSchedule";

export class SimulateAmortizationSchedule {
  constructor(
    private readonly amortizationService: GenerateAmortizationService
  ) {}

  execute(request: CalculateCreditDetailsRequest): AmortizationSchedule {
    const startDate = new Date();
    
    const schedule = this.amortizationService.generate(
      request.amountBorrowed,
      request.annualRate,
      request.insuranceRate,
      request.durationInMonths,
      startDate
    );

    const totalRepayment = schedule.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalInterest = schedule.reduce((sum, row) => sum + row.shareInterest, 0);
    const totalInsurance = schedule.reduce((sum, row) => sum + row.shareInsurance, 0);
    const monthlyPayment = schedule.length > 0 ? schedule[0].totalAmount : 0;

    return {
      schedule,
      summary: {
        monthlyPayment,
        totalRepayment,
        totalInterest,
        totalInsurance,
      },
    };
  }
}
