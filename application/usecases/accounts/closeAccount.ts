import { AccountRepository } from "@application/repositories/account";
import { AccountNotFoundError } from "@application/errors";
import { StatusAccount } from "@domain/values/statusAccount";

type CloseAccountRequest = {
  id: string;
};

export class CloseAccount {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(request: CloseAccountRequest): Promise<void> {
    const account = await this.accountRepository.findById(request.id);

    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!account.canBeClosed()) {
      throw new Error("Cannot close account: balance is not zero");
    }

    await this.accountRepository.updateStatus(
      request.id,
      StatusAccount.CLOSE.getValue()
    );
  }
}
