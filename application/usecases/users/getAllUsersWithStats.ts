import { AccountRepository } from "@application/repositories/account";
import { UserRepository } from "@application/repositories/users";
import { UserStats } from "@application/types/users";

export class GetAllUsersWithStats {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(): Promise<UserStats[]> {
    const users = await this.userRepository.findAll();

    const stats = await Promise.all(
      users.map(async (user) => {
        const accounts = await this.accountRepository.findByOwnerId(user.id);
        const openAccounts = accounts.filter((account) => account.isOpen());

        const totalBalance = accounts.reduce(
          (sum, account) => sum + account.balance,
          0
        );
        const totalAvailableBalance = accounts.reduce(
          (sum, account) => sum + account.availableBalance,
          0
        );

        return {
          user,
          accountsCount: accounts.length,
          openAccountsCount: openAccounts.length,
          totalBalance,
          totalAvailableBalance,
        };
      })
    );

    return stats;
  }
}
