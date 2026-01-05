import { Request, Response } from "express";
import { UserController } from "@express/controllers/UserController";
import { RegisterUserSchema } from "@express/schemas/RegisterUserSchema";
import { LoginUserSchema } from "@express/schemas/LoginUserSchema";
import { ValidationError } from "@application/errors";
import { mapErrorToHttpResponse } from "@express/src/responses/error";
import { sendSuccess } from "@express/src/responses/success";
import { UserView } from "@express/types/responses";
import { User } from "@domain/entities/users";

export class UserHttpHandler {
  constructor(private readonly controller: UserController) {}

  public async register(request: Request, response: Response) {
    try {
      const parsed = RegisterUserSchema.safeParse(request.body);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => issue.message)
          .join(", ");
        throw new ValidationError(issues || "Invalid payload.");
      }

      await this.controller.register(parsed.data);
      return sendSuccess(response, {
        status: 201,
        code: "REGISTRATION_PENDING",
        message: "Registration successful. Please check your email to confirm.",
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

      const authenticatedUser = await this.controller.login(parsed.data);
      return sendSuccess(response, {
        status: 200,
        code: "LOGIN_SUCCESS",
        message: "Login successful.",
        data: { user: this.toUserView(authenticatedUser) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async list(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

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

  private toUserView(user: User): UserView {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role.getValue(),
    };
  }
}
