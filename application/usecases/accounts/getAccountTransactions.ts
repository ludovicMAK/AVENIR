import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";
import { SessionRepository } from "@application/repositories/session";
import { GetAccountTransactionsRequest } from "@application/requests/accounts";
import {
  ConnectedError,
  AccountNotFoundError,
  UnauthorizedError,
} from "@application/errors";
import { Transaction } from "@domain/entities/transaction";

export interface AccountTransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export class GetAccountTransactions {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(
    request: GetAccountTransactionsRequest
  ): Promise<AccountTransactionsResponse> {
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
        "You are not authorized to view this account transactions."
      );
    }

    const filters: {
      startDate?: Date;
      endDate?: Date;
      direction?: string;
      status?: string;
    } = {};

    if (request.startDate) {
      filters.startDate = new Date(request.startDate);
    }

    if (request.endDate) {
      filters.endDate = new Date(request.endDate);
    }

    if (request.direction) {
      filters.direction = request.direction;
    }

    if (request.status) {
      filters.status = request.status;
    }

    const page = request.page || 1;
    const limit = request.limit || 20;

    const pagination = {
      page,
      limit,
    };

    const result = await this.transactionRepository.findByAccountIBAN(
      account.IBAN,
      filters,
      pagination
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      transactions: result.transactions,
      total: result.total,
      page,
      totalPages,
    };
  }
}
