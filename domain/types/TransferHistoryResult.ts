import { Transaction } from "@domain/entities/transaction";

export type TransactionHistoryResult = {
  transactions: Transaction[];
};
