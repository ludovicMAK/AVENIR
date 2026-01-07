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

type AccountTransactionsResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
};

export class GetAccountTransactions {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(
    request: GetAccountTransactionsRequest
  ): Promise<AccountTransactionsResponse> {
    // 1. Vérifier l'authentification
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );

    if (!isConnected) {
      throw new ConnectedError("Authentication failed: User not connected.");
    }

    // 2. Récupérer le compte
    const account = await this.accountRepository.findById(request.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    // 3. Vérifier que l'utilisateur est propriétaire du compte
    if (account.idOwner !== request.userId) {
      throw new UnauthorizedError(
        "You are not authorized to view this account transactions."
      );
    }

    // 4. Préparer les filtres
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

    // 5. Préparer la pagination (par défaut page 1, limit 20)
    const page = request.page || 1;
    const limit = request.limit || 20;

    const pagination = {
      page,
      limit,
    };

    // 6. Récupérer les transactions
    const result = await this.transactionRepository.findByAccountIBAN(
      account.IBAN,
      filters,
      pagination
    );

    // 7. Calculer le nombre total de pages
    const totalPages = Math.ceil(result.total / limit);

    // 8. Retourner les résultats paginés
    return {
      transactions: result.transactions,
      total: result.total,
      page,
      totalPages,
    };
  }
}
