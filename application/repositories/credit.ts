import { UnitOfWork } from "@application/services/UnitOfWork";
import { Credit } from "@domain/entities/credit";

export interface CreditRepository {
  save(credit: Credit, unitOfWork?: UnitOfWork): Promise<void>;
  findById(id: string): Promise<Credit | null>;
  findByCustomerId(customerId: string): Promise<Credit[]>;
  findByStatus(status: string): Promise<Credit[]>;
  update(credit: Credit, unitOfWork?: UnitOfWork): Promise<void>;
  delete(creditId: string): Promise<void>;
}
