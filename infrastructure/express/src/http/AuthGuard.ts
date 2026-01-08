import { Request } from "express";
import { AuthenticateUser } from "@application/usecases/auth/authenticateUser";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@application/errors";
import { User } from "@domain/entities/users";

export class AuthGuard {
  constructor(private readonly authenticateUser: AuthenticateUser) {}

  private extractBearerToken(authorization?: string): string | null {
    if (!authorization) return null;
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token;
    return authorization || null;
  }

  private isUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(value);
  }

  async requireAuthenticated(request: Request): Promise<User> {
    const authorization = request.headers.authorization;
    const token = this.extractBearerToken(authorization);
    const userId = request.headers["x-user-id"] as string;

    if (!userId || !token) {
      throw new UnauthorizedError("Authentication required.");
    }
    if (!this.isUuid(userId)) {
      throw new ValidationError("Invalid user id format (UUID expected).");
    }

    return this.authenticateUser.execute({ userId, token });
  }

  async requireManager(request: Request): Promise<User> {
    const user = await this.requireAuthenticated(request);
    if (user.role.getValue() !== "bankManager") {
      throw new ForbiddenError("Action reserved to bank managers.");
    }
    return user;
  }
}
