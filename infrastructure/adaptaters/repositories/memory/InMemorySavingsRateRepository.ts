import { SavingsRateRepository } from "@application/repositories/savingsRate";
import { SavingsRate } from "@domain/entities/savingsRate";

export class InMemorySavingsRateRepository implements SavingsRateRepository {
  private readonly items: Map<string, SavingsRate> = new Map();

  async save(rate: SavingsRate): Promise<void> {
    this.items.set(rate.id, rate);
  }

  async findById(id: string): Promise<SavingsRate | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<SavingsRate[]> {
    return Array.from(this.items.values()).sort(
      (a, b) => b.dateEffect.getTime() - a.dateEffect.getTime()
    );
  }

  async findActiveRate(date: Date): Promise<SavingsRate | null> {
    const sorted = await this.findAll();
    return sorted.find((rate) => rate.isEffectiveAt(date)) ?? null;
  }

  async findHistory(): Promise<SavingsRate[]> {
    return this.findAll();
  }
}
