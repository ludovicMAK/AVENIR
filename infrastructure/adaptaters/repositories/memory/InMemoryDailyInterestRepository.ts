import { DailyInterestRepository } from "@application/repositories/dailyInterest";
import { DailyInterest } from "@domain/entities/dailyInterest";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryDailyInterestRepository
  implements DailyInterestRepository
{
  private readonly items: Map<string, DailyInterest> = new Map();

  async save(interest: DailyInterest, unitOfWork?: UnitOfWork): Promise<void> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(interest.id, interest);
        },
      });
      return;
    }

    this.items.set(interest.id, interest);
  }

  async findById(id: string): Promise<DailyInterest | null> {
    return this.items.get(id) ?? null;
  }

  async findByAccountId(accountId: string): Promise<DailyInterest[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.accountId === accountId
    );
  }

  async findByDate(date: Date): Promise<DailyInterest[]> {
    const target = date.toDateString();
    return Array.from(this.items.values()).filter(
      (item) => item.date.toDateString() === target
    );
  }

  async findByDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<DailyInterest[]> {
    return Array.from(this.items.values()).filter((item) => {
      const time = item.date.getTime();
      return (
        item.accountId === accountId &&
        time >= from.getTime() &&
        time <= to.getTime()
      );
    });
  }
}
