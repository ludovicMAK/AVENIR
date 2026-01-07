import { GetTransactionHistoryRequest, TransactionInput } from "@application/requests/transaction";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";

export class TransactionController {
  public constructor(
    private readonly createTransactionUsecase: CreateTransaction,
    private readonly getTransactionHistoryUsecase: GetTransactionHistory
  ) {}
  public async createTransaction(input: TransactionInput): Promise<void> {
    return await this.createTransactionUsecase.execute(input);
  }
  public async getTransactionHistory(input: GetTransactionHistoryRequest) : Promise<any> {
    return await this.getTransactionHistoryUsecase.execute(input);
  }

}
