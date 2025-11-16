import { Request, Response } from "express"
import { UserController } from "@express/controllers/UserController"
import { RegisterUserSchema } from "@express/schemas/RegisterUserSchema"
import { LoginUserSchema } from "@express/schemas/LoginUserSchema"
import { ValidationError } from "@application/errors"
import { mapErrorToHttpResponse } from "@express/src/responses/error"
import { sendSuccess } from "@express/src/responses/success"
import { User } from "@domain/entities/users"

export class UserHttpHandler {
    constructor(private readonly controller: UserController) {}

    public async register(request: Request, response: Response) {
        try {
            const parsed = RegisterUserSchema.safeParse(request.body)
            if (!parsed.success) {
                const issues = parsed.error.issues.map((issue) => issue.message).join(", ")
                throw new ValidationError(issues || "Invalid payload.")
            }

            await this.controller.register(parsed.data)
            return sendSuccess(response, {
                status: 201,
                code: "USER_REGISTERED",
                message: "Register successfully.",
            })
        } catch (error) {
            return mapErrorToHttpResponse(response, error)
        }
    }

    public async login(request: Request, response: Response) {
        try {
            const parsed = LoginUserSchema.safeParse(request.body)
            if (!parsed.success) {
                const issues = parsed.error.issues.map((issue) => issue.message).join(", ")
                throw new ValidationError(issues || "Invalid payload.")
            }

            const authenticatedUser = await this.controller.login(parsed.data)
            return sendSuccess(response, {
                status: 200,
                code: "LOGIN_SUCCESS",
                message: "Login successful.",
                data: { user: this.toUserView(authenticatedUser) },
            })
        } catch (error) {
            return mapErrorToHttpResponse(response, error)
        }
    }

    public async list(request: Request, response: Response) {
        try {
            const users = await this.controller.list()
            return sendSuccess(response, {
                status: 200,
                code: "USERS_FOUND",
                data: { users: users.map((user) => this.toUserView(user)) },
            })
        } catch (error) {
            return mapErrorToHttpResponse(response, error)
        }
    }

    private toUserView(user: User) {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role.getValue(),
        }
    }
}