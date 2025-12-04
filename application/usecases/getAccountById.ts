import { Account } from "@domain/entities/account";
import { AccountRepository } from "@application/repositories/account";
import { AccountNotFoundError } from "@application/errors";

type GetAccountByIdRequest = {
  id: string;
};

export class GetAccountById {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(request: GetAccountByIdRequest): Promise<Account> {
    const account = await this.accountRepository.findById(request.id);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return account;
  }
}
