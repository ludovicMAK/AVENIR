import { TransactionRepository } from "@application/repositories/transaction";
import { SessionRepository } from "@application/repositories/session";
import { AccountRepository } from "@application/repositories/account";
import { TransactionHistoryResult } from "@domain/types/TransferHistoryResult";
import { ConnectedError } from "@application/errors";
import { GetTransactionHistoryRequest } from "@application/requests/transaction";

export class GetTransactionHistory {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(
    request: GetTransactionHistoryRequest
  ): Promise<TransactionHistoryResult> {
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const accounts = await this.accountRepository.findByOwnerId(request.userId);

    const allTransactions = await Promise.all(
      accounts.map((account) =>
        this.transactionRepository.findByIban(account.IBAN)
      )
    );

    const transactions = allTransactions.flat();

    return { transactions };
  }
}
