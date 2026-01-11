import { GetTransactionHistoryRequest, TransactionInput } from "@application/requests/transaction";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";
import { GetAccountTransactionsByAdmin, GetAccountTransactionsByAdminRequest, GetAccountTransactionsByAdminResult } from "@application/usecases/transactions/getAccountTransactionsByAdmin";
import { TransactionHistoryResult } from "@domain/types/TransferHistoryResult";

export class TransactionController {
  public constructor(
    private readonly createTransactionUsecase: CreateTransaction,
    private readonly getTransactionHistoryUsecase: GetTransactionHistory,
    private readonly getAccountTransactionsByAdminUsecase: GetAccountTransactionsByAdmin
  ) {}
  
  public async createTransaction(input: TransactionInput): Promise<void> {
    return await this.createTransactionUsecase.execute(input);
  }
  
  public async getTransactionHistory(input: GetTransactionHistoryRequest): Promise<TransactionHistoryResult> {
    return await this.getTransactionHistoryUsecase.execute(input);
  }

  public async getAccountTransactionsByAdmin(input: GetAccountTransactionsByAdminRequest): Promise<GetAccountTransactionsByAdminResult> {
    return await this.getAccountTransactionsByAdminUsecase.execute(input);
  }
}
