import { TransactionInput } from "@application/requests/transaction";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";

export class TransactionController {
  public constructor(
    private readonly createTransactionUsecase: CreateTransaction
  ) {}
  public async createTransaction(input: TransactionInput): Promise<void> {
    return await this.createTransactionUsecase.execute(input);
  }
}
