import { DailyInterest } from "@domain/entities/dailyInterest";
import { SavingsRate } from "@domain/entities/savingsRate";
import {
  DailyInterestDto,
  SavingsRateDto,
} from "../../types/savings";

export function toSavingsRateDto(rate: SavingsRate): SavingsRateDto {
  return {
    id: rate.id,
    rate: rate.rate,
    dateEffect: rate.dateEffect.toISOString(),
  };
}

export function toDailyInterestDto(
  interest: DailyInterest
): DailyInterestDto {
  return {
    id: interest.id,
    date: interest.date.toISOString(),
    calculationBase: interest.calculationBase,
    appliedRate: interest.appliedRate,
    calculatedInterest: interest.calculatedInterest,
    creditMode: interest.creditMode.getValue(),
    accountId: interest.accountId,
    transactionId: interest.transactionId ?? null,
  };
}
