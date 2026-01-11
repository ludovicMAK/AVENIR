import { Request, Response } from "express";
import { UserController } from "@express/controllers/UserController";
import { RegisterUserSchema } from "@express/schemas/RegisterUserSchema";
import { LoginUserSchema } from "@express/schemas/LoginUserSchema";
import {
  ValidationError,
  UnauthorizedError,
} from "@application/errors";
import { mapErrorToHttpResponse } from "@express/src/responses/error";
import { sendSuccess } from "@express/src/responses/success";
import {
  UserView,
  UserRegistrationResponseData,
  UserStatsView,
} from "@express/types/responses";
import { User } from "@domain/entities/users";
import { AuthGuard } from "@express/src/http/AuthGuard";

const isUuid = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(value);
};

export class UserHttpHandler {
  constructor(
    private readonly controller: UserController,
    private readonly authGuard: AuthGuard
  ) {}

  public async register(request: Request, response: Response) {
    try {
      const parsed = RegisterUserSchema.safeParse(request.body);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => issue.message)
          .join(", ");
        throw new ValidationError(issues || "Invalid payload.");
      }

      const result = await this.controller.register(parsed.data);
      return sendSuccess<UserRegistrationResponseData>(response, {
        status: 201,
        code: "REGISTRATION_PENDING",
        message: "Registration successful. Please check your email to confirm.",
        data: { userId: result.userId },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async confirmRegistration(request: Request, response: Response) {
    try {
      const token = request.query.token as string;
      if (!token || typeof token !== "string") {
        throw new ValidationError("Confirmation token is required");
      }

      await this.controller.confirmRegistrationToken(token);
      return sendSuccess(response, {
        status: 200,
        code: "REGISTRATION_CONFIRMED",
        message: "Registration confirmed successfully. You can now login.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async login(request: Request, response: Response) {
    try {
      const parsed = LoginUserSchema.safeParse(request.body);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => issue.message)
          .join(", ");
        throw new ValidationError(issues || "Invalid payload.");
      }

      const { user, token } = await this.controller.login(parsed.data);
      return sendSuccess(response, {
        status: 200,
        code: "LOGIN_SUCCESS",
        message: "Login successful.",
        data: {
          user: this.toUserView(user),
          token,
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async list(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const users = await this.controller.list();
      return sendSuccess(response, {
        status: 200,
        code: "USERS_FOUND",
        data: { users: users.map((user) => this.toUserView(user)) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async me(request: Request, response: Response) {
    try {
      const authorization = request.headers.authorization;
      if (!authorization) {
        throw new UnauthorizedError("Authentication required.");
      }

      const [scheme, token] = authorization.split(" ");
      if (!token || scheme?.toLowerCase() !== "bearer") {
        throw new UnauthorizedError("Invalid authorization header.");
      }

      const user = await this.controller.findByToken(token);
      return sendSuccess(response, {
        status: 200,
        code: "CURRENT_USER_FOUND",
        data: { user: this.toUserView(user) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async listWithStats(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const usersWithStats = await this.controller.listWithStats();
      return sendSuccess(response, {
        status: 200,
        code: "USER_STATS_FOUND",
        data: { users: usersWithStats.map((item) => this.toUserStatsView(item)) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async ban(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const userId =
        request.params.userId || request.params.id || request.params.accountId;
      if (!userId) {
        throw new ValidationError("User id is required.");
      }
      if (!isUuid(userId)) {
        throw new ValidationError("Invalid user id format (UUID expected).");
      }

      await this.controller.ban(userId);
      return sendSuccess(response, {
        status: 200,
        code: "USER_BANNED",
        message: "User has been banned.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async unban(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const userId =
        request.params.userId || request.params.id || request.params.accountId;
      if (!userId) {
        throw new ValidationError("User id is required.");
      }
      if (!isUuid(userId)) {
        throw new ValidationError("Invalid user id format (UUID expected).");
      }

      await this.controller.unban(userId);
      return sendSuccess(response, {
        status: 200,
        code: "USER_UNBANNED",
        message: "User has been unbanned.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async delete(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const userId =
        request.params.userId || request.params.id || request.params.accountId;
      if (!userId) {
        throw new ValidationError("User id is required.");
      }
      if (!isUuid(userId)) {
        throw new ValidationError("Invalid user id format (UUID expected).");
      }

      await this.controller.delete(userId);
      return sendSuccess(response, {
        status: 200,
        code: "USER_DELETED",
        message: "User removed successfully.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  private toUserView(user: User): UserView & { emailVerifiedAt?: string | null };
  private toUserView(user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    status: string;
    emailVerifiedAt?: string | null;
  }): UserView & { emailVerifiedAt?: string | null };
  private toUserView(
    user: User | {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      role: string;
      status: string;
      emailVerifiedAt?: string | null;
    }
  ): UserView & { emailVerifiedAt?: string | null } {
    let role: string;
    if (typeof user.role === 'object' && user.role !== null && 'getValue' in user.role && typeof user.role.getValue === 'function') {
      role = String(user.role.getValue());
    } else {
      role = String(user.role);
    }
    let emailVerifiedAt: string | null | undefined = undefined;
    if (user.emailVerifiedAt !== undefined) {
      if (user.emailVerifiedAt instanceof Date) {
        emailVerifiedAt = user.emailVerifiedAt.toISOString();
      } else {
        emailVerifiedAt = user.emailVerifiedAt ?? undefined;
      }
    }
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role,
      status: user.status,
      ...(emailVerifiedAt !== undefined ? { emailVerifiedAt } : {}),
    };
  }

  private toUserStatsView(item: {
    user: User;
    accountsCount: number;
    openAccountsCount: number;
    totalBalance: number;
    totalAvailableBalance: number;
  }): UserStatsView {
    return {
      ...this.toUserView(item.user),
      accountsCount: item.accountsCount,
      openAccountsCount: item.openAccountsCount,
      totalBalance: item.totalBalance,
      totalAvailableBalance: item.totalAvailableBalance,
    };
  }
}
