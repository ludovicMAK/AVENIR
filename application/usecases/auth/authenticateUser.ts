import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { ConnectedError } from "@application/errors";
import { User } from "@domain/entities/users";

export type AuthenticateUserRequest = {
  userId: string;
  token: string;
};

export class AuthenticateUser {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<User> {
    const { userId, token } = request;
    const isConnected = await this.sessionRepository.isConnected(
      userId,
      token
    );
    if (!isConnected) {
      throw new ConnectedError("authentication failed: User not found.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConnectedError("authentication failed: User not found.");
    }

    if (!user.isActive()) {
      throw new ConnectedError("authentication failed: User is banned.");
    }

    return user;
  }
}
