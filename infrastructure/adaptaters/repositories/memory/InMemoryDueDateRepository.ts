import { DueDateRepository } from "@application/repositories/dueDate";
import { DueDate } from "@domain/entities/dueDate";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryDueDateRepository implements DueDateRepository {
  private readonly items: Map<string, DueDate> = new Map();

  async save(dueDate: DueDate, unitOfWork?: UnitOfWork): Promise<void> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(dueDate.id, dueDate);
        },
      });
    } else {
      this.items.set(dueDate.id, dueDate);
    }
  }

  async findById(id: string): Promise<DueDate | null> {
    return this.items.get(id) || null;
  }

  async findByCreditId(creditId: string): Promise<DueDate[]> {
    return Array.from(this.items.values()).filter((d) => d.creditId === creditId);
  }

  async findByStatus(status: string): Promise<DueDate[]> {
    return Array.from(this.items.values()).filter((d) => d.status.getValue() === status);
  }

  async findOverdue(): Promise<DueDate[]> {
    const now = new Date();
    return Array.from(this.items.values()).filter((d) => d.status.getValue() === "payable" && d.dueDate < now);
  }

  async update(dueDate: DueDate, unitOfWork?: UnitOfWork): Promise<void> {
    this.items.set(dueDate.id, dueDate);
  }

  async delete(dueDateId: string): Promise<void> {
    this.items.delete(dueDateId);
  }

  clear(): void {
    this.items.clear();
  }
}
