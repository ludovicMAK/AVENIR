import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { ConnectedError, ValidationError } from "@application/errors";
import { User } from "@domain/entities/users";

export type AuthenticateUserRequest = {
  userId?: string;
  token?: string;
};

export class AuthenticateUser {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<User> {
    const { userId, token } = request;

    if (!userId || !token) {
      throw new ValidationError("Authentication required");
    }

    if (!this.isUuid(userId)) {
      throw new ValidationError("Invalid user id format (UUID expected).");
    }

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

    return user;
  }

  private isUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(value);
  }
}
