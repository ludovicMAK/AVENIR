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

type AccountStatementResponse = {
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
};

export class GetAccountStatement {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(
    request: GetAccountStatementRequest
  ): Promise<AccountStatementResponse> {
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
        "You are not authorized to view this account statement."
      );
    }

    // 4. Convertir les dates
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    // 5. Récupérer toutes les transactions avant la date de début pour calculer le solde initial
    const transactionsBeforeStart =
      await this.transactionRepository.findByAccountIBAN(account.IBAN, {
        endDate: fromDate,
        status: "VALIDATED", // Uniquement les transactions validées
      });

    // 6. Calculer le solde initial
    let initialBalance = 0;
    for (const transaction of transactionsBeforeStart.transactions) {
      if (transaction.transactionDirection.getValue() === "CREDIT") {
        initialBalance += transaction.amount;
      } else {
        initialBalance -= transaction.amount;
      }
    }

    // 7. Récupérer les transactions dans la période demandée
    const transactionsInPeriod =
      await this.transactionRepository.findByAccountIBAN(account.IBAN, {
        startDate: fromDate,
        endDate: toDate,
        status: "VALIDATED",
      });

    // 8. Calculer le solde final
    let finalBalance = initialBalance;
    for (const transaction of transactionsInPeriod.transactions) {
      if (transaction.transactionDirection.getValue() === "CREDIT") {
        finalBalance += transaction.amount;
      } else {
        finalBalance -= transaction.amount;
      }
    }

    // 9. Retourner le relevé de compte
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
