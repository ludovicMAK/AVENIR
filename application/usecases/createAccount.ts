import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { AccountRepository } from "@application/repositories/account";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { IBANGenerator } from "@application/services/IBANGenreator";

type CreateAccountRequest = {
  accountType: string;
  accountName: string;
  authorizedOverdraft: boolean;
  overdraftLimit: number;
  overdraftFees: number;
  idOwner: string;
};

export class CreateAccount {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly ibanGenerator: IBANGenerator
  ) {}

  async execute(request: CreateAccountRequest): Promise<Account> {
    const accountType = AccountType.from(request.accountType);
    const id = this.uuidGenerator.generate();
    const iban = this.ibanGenerator.generate();

    const account = new Account(
      id,
      accountType,
      iban,
      request.accountName,
      request.authorizedOverdraft,
      request.overdraftLimit,
      request.overdraftFees,
      StatusAccount.OPEN,
      request.idOwner,
      0 // balance initial
    );

    await this.accountRepository.save(account);
    return account;
  }
}
