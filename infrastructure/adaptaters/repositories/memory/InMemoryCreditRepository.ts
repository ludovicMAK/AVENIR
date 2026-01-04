import { CreditRepository } from "@application/repositories/credit";
import { Credit } from "@domain/entities/credit";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryCreditRepository implements CreditRepository {
  private readonly items: Map<string, Credit> = new Map();

  async save(credit: Credit, unitOfWork?: UnitOfWork): Promise<void> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(credit.id, credit);
        },
      });
    } else {
      this.items.set(credit.id, credit);
    }
  }

  async findById(id: string): Promise<Credit | null> {
    return this.items.get(id) || null;
  }

  async findByCustomerId(customerId: string): Promise<Credit[]> {
    return Array.from(this.items.values()).filter((c) => c.customerId === customerId);
  }

  async findByStatus(status: string): Promise<Credit[]> {
    return Array.from(this.items.values()).filter((c) => c.status.getValue() === status);
  }

  async update(credit: Credit): Promise<void> {
    this.items.set(credit.id, credit);
  }

  async delete(creditId: string): Promise<void> {
    this.items.delete(creditId);
  }

  clear(): void {
    this.items.clear();
  }
}
