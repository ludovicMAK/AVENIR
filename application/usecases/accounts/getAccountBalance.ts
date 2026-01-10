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
        "You are not authorized to view this account balance."
      );
    }

    const blockedAmount = account.balance - account.availableBalance;

    return {
      balance: account.balance,
      availableBalance: account.availableBalance,
      blockedAmount: blockedAmount >= 0 ? blockedAmount : 0,
    };
  }
}
