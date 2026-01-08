import { SavingsRate } from "@domain/entities/savingsRate";

export interface SavingsRateRepository {
  save(rate: SavingsRate): Promise<void>;
  findById(id: string): Promise<SavingsRate | null>;
  findAll(): Promise<SavingsRate[]>;
  findActiveRate(date: Date): Promise<SavingsRate | null>;
  findHistory(): Promise<SavingsRate[]>;
}
