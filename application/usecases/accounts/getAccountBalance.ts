import { AccountRepository } from "@application/repositories/account";
import { SessionRepository } from "@application/repositories/session";
import { GetAccountBalanceRequest } from "@application/requests/accounts";
import {
  ConnectedError,
  AccountNotFoundError,
  UnauthorizedError,
} from "@application/errors";

type AccountBalanceResponse = {
  balance: number;
  availableBalance: number;
  blockedAmount: number;
};

export class GetAccountBalance {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(
    request: GetAccountBalanceRequest
  ): Promise<AccountBalanceResponse> {
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
        "You are not authorized to view this account balance."
      );
    }

    // 4. Calculer le montant bloqué
    const blockedAmount = account.balance - account.availableBalance;

    // 5. Retourner le solde détaillé
    return {
      balance: account.balance,
      availableBalance: account.availableBalance,
      blockedAmount: blockedAmount >= 0 ? blockedAmount : 0,
    };
  }
}
