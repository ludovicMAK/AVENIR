import { UserRepository } from "@application/repositories/users";
import { UnauthorizedError } from "@application/errors";
import { User } from "@domain/entities/users";
import { LoginUserInput } from "@application/requests/auth";
import { PasswordHasher } from "@application/services/PasswordHasher";
import { TokenGenerator } from "@application/services/TokenGenerator";
import { SessionRepository } from "@application/repositories/session";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { Session } from "@domain/entities/session";

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly uuidGenerator: UuidGenerator,
    private readonly tokenGenrator: TokenGenerator,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(input: LoginUserInput): Promise<User> {
    const email = input.email.toLowerCase();

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.canLogin()) {
      throw new UnauthorizedError("Please verify your email address to login");
    }
    const sessionId = this.uuidGenerator.generate();
    const token = this.tokenGenrator.generate();
    const session = new Session(
      sessionId,
      user.id,
      token,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      new Date()
    );
    
    await this.sessionRepository.createSession(session);
    

    return user;
  }
}
