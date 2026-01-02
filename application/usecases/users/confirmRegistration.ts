import { UserRepository } from "@application/repositories/users";
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens";
import { NotFoundError, ValidationError } from "@application/errors";
import { AccountRepository } from "@application/repositories/account";
import { IBANGenerator } from "@application/services/IBANGenreator";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class ConfirmRegistration {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailConfirmationTokenRepository: EmailConfirmationTokenRepository,
    private readonly accountRepository: AccountRepository,
    private readonly ibanGenerator: IBANGenerator,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(token: string): Promise<void> {
    const confirmationToken =
      await this.emailConfirmationTokenRepository.findByToken(token);

    if (!confirmationToken) {
      throw new NotFoundError("Invalid or expired confirmation token");
    }

    if (confirmationToken.isExpired()) {
      await this.emailConfirmationTokenRepository.deleteByToken(token);
      throw new ValidationError("Confirmation token has expired");
    }

    await this.userRepository.setEmailVerified(
      confirmationToken.userId,
      new Date()
    );
    await this.emailConfirmationTokenRepository.deleteByToken(token);

    const accountId = this.uuidGenerator.generate();
    const iban = this.ibanGenerator.generate();
    const account = new Account(
      accountId,
      AccountType.CURRENT,
      iban,
      "Main Account",
      false,
      0,
      0,
      StatusAccount.OPEN,
      confirmationToken.userId,
      0,
      0
    );
    await this.accountRepository.save(account);
  }
}
