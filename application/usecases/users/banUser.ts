import { UserRepository } from "@application/repositories/users";
import { NotFoundError } from "@application/errors";

export class BanUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isBanned()) {
      return;
    }

    await this.userRepository.updateStatus(userId, "banned");
  }
}
