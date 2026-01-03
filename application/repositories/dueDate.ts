import { UnitOfWork } from "@application/services/UnitOfWork";
import { DueDate } from "@domain/entities/dueDate";

export interface DueDateRepository {
  save(dueDate: DueDate): Promise<void>;
  findById(id: string): Promise<DueDate | null>;
  findByCreditId(creditId: string): Promise<DueDate[]>;
  findByStatus(status: string): Promise<DueDate[]>;
  findOverdue(): Promise<DueDate[]>;
  update(dueDate: DueDate): Promise<void>;
  delete(dueDateId: string): Promise<void>;
}
