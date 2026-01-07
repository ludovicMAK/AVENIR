import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { ConnectedError, NotFoundError, UnauthorizedError } from "@application/errors/index";
import { UserRepository } from "@application/repositories/users";
import { AccountRepository } from "@application/repositories/account";

export type GetAccountTransactionsByAdminRequest = {
  userId: string;
  token: string;
  iban: string;
};

export type GetAccountTransactionsByAdminResult = {
  transactions: Transaction[];
};

export class GetAccountTransactionsByAdmin {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(input: GetAccountTransactionsByAdminRequest): Promise<GetAccountTransactionsByAdminResult> {
    const userInformationConnected = await this.userRepository.getInformationUserConnected(input.userId, input.token);
    if (!userInformationConnected) {
      throw new ConnectedError("Authentication failed: User not found.");
    }

    const role = userInformationConnected.role.getValue();
    if (role !== "bankManager" && role !== "bankAdvisor") {
      throw new UnauthorizedError("Unauthorized: Only bank administrators can view account transactions.");
    }

    const account = await this.accountRepository.findByIBAN(input.iban);
    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    const transactions = await this.transactionRepository.findByIban(input.iban);

    return { transactions };
  }
}
