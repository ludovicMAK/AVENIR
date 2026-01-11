import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";
import { SessionRepository } from "@application/repositories/session";
import { GetAccountStatementRequest } from "@application/requests/accounts";
import {
  ConnectedError,
  AccountNotFoundError,
  UnauthorizedError,
} from "@application/errors";
import { Transaction } from "@domain/entities/transaction";

export interface AccountStatementResponse {
  account: {
    iban: string;
    name: string;
  };
  period: {
    from: Date;
    to: Date;
  };
  initialBalance: number;
  transactions: Transaction[];
  finalBalance: number;
}

export class GetAccountStatement {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(
    request: GetAccountStatementRequest
  ): Promise<AccountStatementResponse> {
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );

    if (!isConnected) {
      throw new ConnectedError("Authentication failed: User not connected.");
    }

    const account = await this.accountRepository.findById(request.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    if (account.idOwner !== request.userId) {
      throw new UnauthorizedError(
        "You are not authorized to view this account statement."
      );
    }

    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    const transactionsBeforeStart =
      await this.transactionRepository.findByAccountIBAN(account.IBAN, {
        endDate: fromDate,
        status: "VALIDATED",
      });

    let initialBalance = 0;
    for (const transaction of transactionsBeforeStart.transactions) {
      if (transaction.transactionDirection.getValue() === "CREDIT") {
        initialBalance += transaction.amount;
      } else {
        initialBalance -= transaction.amount;
      }
    }

    const transactionsInPeriod =
      await this.transactionRepository.findByAccountIBAN(account.IBAN, {
        startDate: fromDate,
        endDate: toDate,
        status: "VALIDATED",
      });

    let finalBalance = initialBalance;
    for (const transaction of transactionsInPeriod.transactions) {
      if (transaction.transactionDirection.getValue() === "CREDIT") {
        finalBalance += transaction.amount;
      } else {
        finalBalance -= transaction.amount;
      }
    }

    return {
      account: {
        iban: account.IBAN,
        name: account.accountName,
      },
      period: {
        from: fromDate,
        to: toDate,
      },
      initialBalance,
      transactions: transactionsInPeriod.transactions,
      finalBalance,
    };
  }
}
