import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { AccountRepository } from "@application/repositories/account";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { IBANGenerator } from "@application/services/IBANGenreator";
import { CreateAccountRequest } from "@application/requests/accounts";
import { SessionRepository } from "@application/repositories/session";
import { ConnectedError } from "@application/errors";



export class CreateAccount {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly ibanGenerator: IBANGenerator
  ) {}

  async execute(request: CreateAccountRequest): Promise<Account> {
    const isConnected = await this.sessionRepository.isConnected(request.idOwner, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }
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
      0 
    );

    await this.accountRepository.save(account);
    return account;
  }
}
