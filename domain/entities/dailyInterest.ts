import { CreditMode } from "@domain/values/creditMode";

export class DailyInterest {
  constructor(
    readonly id: string,
    readonly date: Date,
    readonly calculationBase: number,
    readonly appliedRate: number,
    readonly calculatedInterest: number,
    readonly creditMode: CreditMode,
    readonly accountId: string,
    readonly transactionId?: string | null
  ) {}
}
