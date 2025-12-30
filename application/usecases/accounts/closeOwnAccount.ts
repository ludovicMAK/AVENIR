import { AccountRepository } from "@application/repositories/account";
import { AccountNotFoundError, CannotBeClosedError, ConnectedError, UnauthorizedError } from "@application/errors";
import { StatusAccount } from "@domain/values/statusAccount";
import { CloseOwnAccountRequest } from "@application/requests/accounts";
import { SessionRepository } from "@application/repositories/session";




export class CloseOwnAccount {
  constructor(private readonly accountRepository: AccountRepository, private readonly sessionRepository: SessionRepository) {}

  async execute(request: CloseOwnAccountRequest): Promise<void> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }
    

    const account = await this.accountRepository.findByIdAndUserId(request.idAccount, request.userId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!account.canBeClosed()) {
      throw new CannotBeClosedError("Cannot close account: balance is not zero");
    }

    await this.accountRepository.updateStatus(
      request.idAccount,
      StatusAccount.CLOSE.getValue()
    );
  }
}
