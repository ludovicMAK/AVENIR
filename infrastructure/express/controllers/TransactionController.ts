import { TransactionInput } from "@application/requests/transaction";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionsByAccount, GetTransactionsByAccountInput } from "@application/usecases/transactions/getTransactionsByAccount";

export class TransactionController {
  public constructor(
    private readonly createTransactionUsecase: CreateTransaction,
    private readonly getTransactionsByAccountUsecase: GetTransactionsByAccount
  ) {}
  public async createTransaction(input: TransactionInput): Promise<string> {
    return await this.createTransactionUsecase.execute(input);
  }
  public async getTransactionsByAccount(input: GetTransactionsByAccountInput) {
    return this.getTransactionsByAccountUsecase.execute(input);
  }
}
