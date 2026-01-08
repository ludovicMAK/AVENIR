import { UserRepository } from "@application/repositories/users";
import { SessionRepository } from "@application/repositories/session";
import { User } from "@domain/entities/users";
import { UnauthorizedError } from "@application/errors";

export class GetUserByToken {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(token: string): Promise<User> {
    // Récupérer l'userId à partir du token
    const userId = await this.sessionRepository.getUserIdByToken(token);

    if (!userId) {
      throw new UnauthorizedError("Invalid or expired session");
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive()) {
      throw new UnauthorizedError("User is banned");
    }

    return user;
  }
}
