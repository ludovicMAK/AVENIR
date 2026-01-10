import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";

export interface Credit {
  id: string;
  customerId: string;
  advisorId: string;
  accountId: string;
  amountBorrowed: number;
  annualRate: number;
  insuranceRate: number;
  durationInMonths: number;
  monthlyPayment: number;
  status: string;
  dateGranted: string;
  totalAmountDue: number;
  totalPaid: number;
  remainingAmount: number;
}

export interface DueDate {
  id: string;
  creditId: string;
  dueDate: string;
  amountDue: number;
  principal: number;
  interest: number;
  insurance: number;
  status: string;
  paidDate?: string;
  paidAmount?: number;
}

export interface CreditWithDueDates extends Credit {
  dueDates: DueDate[];
}

export interface AmortizationScheduleEntry {
  month: number;
  dueDate: string;
  monthlyPayment: number;
  principal: number;
  interest: number;
  insurance: number;
  remainingCapital: number;
}

export interface SimulateScheduleRequest {
  amountBorrowed: number;
  annualRate: number;
  insuranceRate: number;
  durationInMonths: number;
}

export interface PayInstallmentRequest {
  dueDateId: string;
  accountId: string;
}

export interface EarlyRepaymentRequest {
  creditId: string;
  accountId: string;
  amount: number;
}

export interface GrantCreditRequest {
  customerId: string;
  accountId: string;
  amountBorrowed: number;
  annualRate: number;
  insuranceRate: number;
  durationInMonths: number;
}

function parseDueDate(data: any): DueDate {
  const extractValue = (field: any): string => {
    if (typeof field === 'string') return field;
    if (field && typeof field === 'object' && 'value' in field) return field.value;
    return '';
  };

  return {
    id: extractValue(data.id) || '',
    creditId: extractValue(data.creditId || data.credit_id) || '',
    dueDate: extractValue(data.dueDate || data.due_date) || new Date().toISOString(),
    amountDue: Number(data.amountDue || data.amount_due || data.totalAmount || 0),
    principal: Number(data.principal || data.repaymentPortion || 0),
    interest: Number(data.interest || data.shareInterest || 0),
    insurance: Number(data.insurance || data.shareInsurance || 0),
    status: extractValue(data.status) || 'pending',
    paidDate: data.paidDate || data.paid_date || data.paymentDate ? extractValue(data.paidDate || data.paid_date || data.paymentDate) : undefined,
    paidAmount: data.paidAmount || data.paid_amount ? Number(data.paidAmount || data.paid_amount) : undefined,
  };
}

function parseCredit(data: any): Credit {
  const extractValue = (field: any): string => {
    if (typeof field === 'string') return field;
    if (field && typeof field === 'object' && 'value' in field) return field.value;
    return '';
  };

  return {
    id: extractValue(data.id) || '',
    customerId: extractValue(data.customerId || data.customer_id) || '',
    advisorId: extractValue(data.advisorId || data.advisor_id) || '',
    accountId: extractValue(data.accountId || data.account_id) || '',
    amountBorrowed: Number(data.amountBorrowed || data.amount_borrowed || 0),
    annualRate: Number(data.annualRate || data.annual_rate || 0),
    insuranceRate: Number(data.insuranceRate || data.insurance_rate || 0),
    durationInMonths: Number(data.durationInMonths || data.duration_in_months || 0),
    monthlyPayment: Number(data.monthlyPayment || data.monthly_payment || 0),
    status: extractValue(data.status) || 'unknown',
    dateGranted: extractValue(data.dateGranted || data.date_granted || data.startDate) || new Date().toISOString(),
    totalAmountDue: Number(data.totalAmountDue || data.total_amount_due || 0),
    totalPaid: Number(data.totalPaid || data.total_paid || 0),
    remainingAmount: Number(data.remainingAmount || data.remaining_amount || data.amountBorrowed || data.amount_borrowed || 0),
  };
}

function parseCreditWithDueDates(data: any): CreditWithDueDates {
  const creditData = data.credit || data;
  const dueDatesData = data.dueDates || [];
  
  return {
    ...parseCredit(creditData),
    dueDates: dueDatesData.map(parseDueDate),
  };
}

function parseAmortizationEntry(data: any): AmortizationScheduleEntry {
  return {
    month: Number(data.month),
    dueDate: data.dueDate,
    monthlyPayment: Number(data.monthlyPayment || data.totalAmount),
    principal: Number(data.principal || data.repaymentPortion),
    interest: Number(data.interest || data.shareInterest),
    insurance: Number(data.insurance || data.shareInsurance),
    remainingCapital: Number(data.remainingCapital),
  };
}

export const creditsApi = {
  async getMyCredits(): Promise<CreditWithDueDates[]> {
    const response = await request("/my-credits");
    if (!isJsonObject(response)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid credits response");
    }
    const creditsData =
      (response as { credits?: unknown; creditWithDueDates?: unknown })
        .credits ?? response.creditWithDueDates;
    if (!Array.isArray(creditsData)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid credits response");
    }
    return creditsData.map(parseCreditWithDueDates);
  },

  async getCreditStatus(creditId: string): Promise<Credit> {
    const response = await request(`/credits/${creditId}/status`);
    if (!isJsonObject(response)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid credit status response"
      );
    }
    const creditStatusData = response.creditStatusData;
    if (!isJsonObject(creditStatusData) || !isJsonObject(creditStatusData.credit) || !isJsonObject(creditStatusData.progress)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid credit status response"
      );
    }
    
    const credit = creditStatusData.credit;
    const progress = creditStatusData.progress;
    
    const totalAmount = Number(progress.totalAmountToPay || 0);
    const duration = Number(credit.durationInMonths || 1);
    const monthlyPayment = duration > 0 ? totalAmount / duration : 0;
    const parsedCredit = parseCredit(credit);

    return {
      ...parsedCredit,
      monthlyPayment,
      totalAmountDue: Number(progress.totalAmountToPay || 0),
      totalPaid: Number(progress.totalAmountPaid || 0),
      remainingAmount: Number(progress.totalAmountRemaining || 0),
    };
  },

  async getPaymentHistory(creditId: string): Promise<DueDate[]> {
    const response = await request(`/credits/${creditId}/due-dates`);
    if (!isJsonObject(response) || !Array.isArray(response.dueDates)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid due dates response"
      );
    }
    return response.dueDates.map(parseDueDate);
  },

  async simulateSchedule(
    data: SimulateScheduleRequest
  ): Promise<AmortizationScheduleEntry[]> {
    const response = await request("/credits/simulate-schedule", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !Array.isArray(response.schedule)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid simulate schedule response"
      );
    }
    return response.schedule.map(parseAmortizationEntry);
  },

  async payInstallment(data: PayInstallmentRequest): Promise<void> {
    await request(`/due-dates/${data.dueDateId}/pay`, {
      method: "POST",
      body: JSON.stringify({ accountId: data.accountId }),
    });
  },

  async earlyRepayment(data: EarlyRepaymentRequest): Promise<void> {
    await request(`/credits/${data.creditId}/early-repayment`, {
      method: "POST",
      body: JSON.stringify({
        accountId: data.accountId,
        amount: data.amount,
      }),
    });
  },

  async grantCredit(data: GrantCreditRequest): Promise<{ creditId: string }> {
    const response = await request("/credits/grant", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.credit)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid grant credit response"
      );
    }
    return { creditId: (response.credit as { id: string }).id };
  },
};
