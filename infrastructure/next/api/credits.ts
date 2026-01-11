import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";

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

const isJsonObjectArray = (
  value: JsonValue | undefined
): value is JsonObject[] =>
  Array.isArray(value) && value.every(isJsonObject);

const extractString = (field: JsonValue | undefined): string => {
  if (field === null || field === undefined) {
    return "";
  }
  if (typeof field === "string") {
    return field;
  }
  if (typeof field === "number" || typeof field === "boolean") {
    return String(field);
  }
  if (!Array.isArray(field) && typeof field === "object" && "value" in field) {
    const nestedValue = (field as JsonObject).value;
    if (
      typeof nestedValue === "string" ||
      typeof nestedValue === "number" ||
      typeof nestedValue === "boolean"
    ) {
      return String(nestedValue);
    }
  }
  return "";
};

function parseDueDate(data: JsonObject): DueDate {
  return {
    id: extractString(data.id),
    creditId: extractString(data.creditId),
    dueDate: extractString(data.dueDate),
    amountDue: Number(data.amountDue),
    principal: Number(data.principal),
    interest: Number(data.interest),
    insurance: Number(data.insurance),
    status: extractString(data.status),
    paidDate: data.paidDate ? extractString(data.paidDate) : undefined,
    paidAmount: data.paidAmount ? Number(data.paidAmount) : undefined,
  };
}

function parseCredit(data: JsonObject): Credit {
  return {
    id: extractString(data.id),
    customerId: extractString(data.customerId),
    advisorId: extractString(data.advisorId),
    accountId: extractString(data.accountId),
    amountBorrowed: Number(data.amountBorrowed),
    annualRate: Number(data.annualRate),
    insuranceRate: Number(data.insuranceRate),
    durationInMonths: Number(data.durationInMonths),
    monthlyPayment: Number(data.monthlyPayment),
    status: extractString(data.status),
    dateGranted: extractString(data.dateGranted),
    totalAmountDue: Number(data.totalAmountDue),
    totalPaid: Number(data.totalPaid),
    remainingAmount: Number(data.remainingAmount),
  };
}

function parseCreditWithDueDates(data: JsonObject): CreditWithDueDates {
  return {
    ...parseCredit(data),
    dueDates: Array.isArray(data.dueDates)
      ? data.dueDates.filter(isJsonObject).map(parseDueDate)
      : [],
  };
}

function parseAmortizationEntry(data: JsonObject): AmortizationScheduleEntry {
  return {
    month: Number(data.month),
    dueDate: extractString(data.dueDate),
    monthlyPayment: Number(data.monthlyPayment),
    principal: Number(data.principal),
    interest: Number(data.interest),
    insurance: Number(data.insurance),
    remainingCapital: Number(data.remainingCapital),
  };
}

export const creditsApi = {
  async getMyCredits(): Promise<CreditWithDueDates[]> {
    const response = await request("/my-credits");
    if (!isJsonObject(response) || !Array.isArray(response.credits) || !response.credits.every(isJsonObject)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid credits response");
    }
    return (response.credits as JsonObject[]).map(parseCreditWithDueDates);
  },

  async getCreditStatus(creditId: string): Promise<Credit> {
    const response = await request(`/credits/${creditId}/status`);
    if (!isJsonObject(response) || !isJsonObject(response.creditStatusData) || !isJsonObject(response.creditStatusData.credit) || !isJsonObject(response.creditStatusData.progress)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid credit status response");
    }
    const credit = response.creditStatusData.credit;
    const progress = response.creditStatusData.progress;
    return {
      ...parseCredit(credit),
      monthlyPayment: Number(progress.monthlyPayment),
      totalAmountDue: Number(progress.totalAmountToPay),
      totalPaid: Number(progress.totalAmountPaid),
      remainingAmount: Number(progress.totalAmountRemaining),
    };
  },

  async getPaymentHistory(creditId: string): Promise<DueDate[]> {
    const response = await request(`/credits/${creditId}/due-dates`);
    if (!isJsonObject(response) || !Array.isArray(response.dueDates) || !response.dueDates.every(isJsonObject)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid due dates response");
    }
    return response.dueDates.filter(isJsonObject).map(parseDueDate);
  },

  async simulateSchedule(
    data: SimulateScheduleRequest
  ): Promise<AmortizationScheduleEntry[]> {
    const response = await request("/credits/simulate-schedule", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !Array.isArray(response.schedule) || !response.schedule.every(isJsonObject)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid simulate schedule response");
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
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid grant credit response");
    }
    return { creditId: String(response.credit.id) };
  },
};
