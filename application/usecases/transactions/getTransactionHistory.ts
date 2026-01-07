import { TransactionRepository } from "@application/repositories/transaction";
import { SessionRepository } from "@application/repositories/session";

import { TransactionHistoryResult } from "@domain/types/TransferHistoryResult";
import { ConnectedError } from "@application/errors";
import { GetTransactionHistoryRequest } from "@application/requests/transaction";

export class GetTransactionHistory {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(request: GetTransactionHistoryRequest): Promise<TransactionHistoryResult> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const transactions = await this.transactionRepository.findByIban(request.userId);

    return { transactions };
  }
}
