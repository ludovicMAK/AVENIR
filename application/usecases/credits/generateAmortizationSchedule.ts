export type AmortizationRow = {
  dueDate: Date;
  totalAmount: number; 
  shareInterest: number; 
  shareInsurance: number; 
  repaymentPortion: number; 
};

export class GenerateAmortizationSchedule {
  execute(
    principal: number, 
    annualRate: number, 
    insuranceRate: number, 
    durationInMonths: number,
    startDate: Date
  ): AmortizationRow[] {
    const rows: AmortizationRow[] = [];

    if (durationInMonths <= 0) return rows;

    const monthlyRate = annualRate / 100 / 12;
    const monthlyInsuranceRaw = (insuranceRate / 100) * principal / durationInMonths;

    let monthlyPaymentWithoutInsurance: number;
    if (monthlyRate === 0) {
      monthlyPaymentWithoutInsurance = principal / durationInMonths;
    } else {
      monthlyPaymentWithoutInsurance =
        (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationInMonths));
    }

    let remainingPrincipal = principal;
    const monthlyInsurance = Math.round(monthlyInsuranceRaw);

    let totalPrincipalRounded = 0;

    for (let i = 1; i <= durationInMonths; i++) {
      const due = new Date(startDate);
      due.setMonth(due.getMonth() + i);

      const interestRaw = remainingPrincipal * monthlyRate;
      const interest = Math.round(interestRaw);

      const principalRepaymentRaw = monthlyPaymentWithoutInsurance - interestRaw;
      let principalRepayment = Math.round(principalRepaymentRaw);

      if (i === durationInMonths) {
        principalRepayment = remainingPrincipal;
      }

      const total = principalRepayment + interest + monthlyInsurance;

      rows.push({
        dueDate: due,
        totalAmount: total,
        shareInterest: interest,
        shareInsurance: monthlyInsurance,
        repaymentPortion: principalRepayment,
      });

      remainingPrincipal = remainingPrincipal - principalRepayment;
      totalPrincipalRounded += principalRepayment;
    }

    const principalDiff = principal - totalPrincipalRounded;
    if (principalDiff !== 0 && rows.length > 0) {
      const last = rows[rows.length - 1];
      last.repaymentPortion = last.repaymentPortion + principalDiff;
      last.totalAmount = last.totalAmount + principalDiff;
    }

    return rows;
  }
}
