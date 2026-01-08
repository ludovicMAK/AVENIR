import { AccountRepository } from "@application/repositories/account";
import { OrderRepository } from "@application/repositories/order";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { UserRepository } from "@application/repositories/users";
import { NotFoundError, ValidationError } from "@application/errors";

export class DeleteUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly orderRepository: OrderRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository,
    private readonly shareTransactionRepository: ShareTransactionRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [accounts, orders, positions, shareTransactions] = await Promise.all([
      this.accountRepository.findByOwnerId(userId),
      this.orderRepository.findByCustomerId(userId),
      this.securitiesPositionRepository.findByCustomerId(userId),
      this.shareTransactionRepository.findByCustomerId(userId),
    ]);

    if (orders.length > 0) {
      throw new ValidationError(
        "Cannot delete user with existing orders. Cancel them first."
      );
    }

    if (positions.length > 0) {
      throw new ValidationError(
        "Cannot delete user while positions are still held."
      );
    }

    if (shareTransactions.length > 0) {
      throw new ValidationError(
        "Cannot delete user with trading history attached."
      );
    }

    if (accounts.length > 0) {
      await Promise.all(
        accounts.map((account) => this.accountRepository.delete(account.id))
      );
    }

    await this.userRepository.delete(userId);
  }
}
