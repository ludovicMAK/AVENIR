import { Transaction } from "@domain/entities/transaction";
import { UnitOfWork } from "@application/services/UnitOfWork";

export interface TransactionRepository {
  createTransaction(
    transaction: Transaction,
    unitOfWork?: UnitOfWork
  ): Promise<void>;
  getAllTransactionsByTransferId(transferId: string): Promise<Transaction[]>;
  update(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void>;
  findByAccountIBAN(
    iban: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      direction?: string;
      status?: string;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ): Promise<{ transactions: Transaction[]; total: number }>;
    findByIban(iban: string): Promise<Transaction[]>

}


    
