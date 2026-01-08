import { DailyInterest } from "@domain/entities/dailyInterest";
import { UnitOfWork } from "@application/services/UnitOfWork";

export interface DailyInterestRepository {
  save(interest: DailyInterest, unitOfWork?: UnitOfWork): Promise<void>;
  findById(id: string): Promise<DailyInterest | null>;
  findByAccountId(accountId: string): Promise<DailyInterest[]>;
  findByDate(date: Date): Promise<DailyInterest[]>;
  findByDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<DailyInterest[]>;
}
