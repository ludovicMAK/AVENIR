import { UserRepository } from "@/application/repositories/users";
import { RegisterUser } from "@/application/usecase/registerUser";
import { GetAllUsers } from "@/application/usecase/getAllUsers";
import { Request, Response } from "express";
import { mapErrorToHttpResponse } from "@/infrastructure/express/src/responses/error";
import { LoginUser } from "@/application/usecase/loginUser";
import { ValidationError } from "@/application/errors";
import { mapSuccessToHttpResponse } from "@/infrastructure/express/src/responses/success";
import { CreatedSuccess, OkSuccess } from "@/application/success";
import { RegisterUserSchema } from "@/infrastructure/express/src/schemas/RegisterUserSchema";

export class UserController {
    public constructor(
        private readonly userRepository: UserRepository,
    ) {}

    public async register(request: Request, response: Response) {
        try {
            const parseResult = RegisterUserSchema.safeParse(request.body);
            if (!parseResult.success) {
                const issues = parseResult.error.issues.map((issue) => issue.message).join(", ");
                throw new ValidationError(issues || "Invalid payload.");
            }

            const registerUser = new RegisterUser(this.userRepository);
            await registerUser.execute(parseResult.data);

            mapSuccessToHttpResponse(response, new CreatedSuccess("Register successfully."));
        } catch (error) {
            mapErrorToHttpResponse(response, error);
        }
    }

    public async login(request: Request, response: Response) {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                throw new ValidationError("Missing parameters.");
            }

            const loginUser = new LoginUser(this.userRepository);
            const authenticatedUser = await loginUser.execute({ email, password });

            mapSuccessToHttpResponse(response, new OkSuccess("Login successful.", {
                user: {
                    id: authenticatedUser.id,
                    firstname: authenticatedUser.firstname,
                    lastname: authenticatedUser.lastname,
                    email: authenticatedUser.email,
                    role: authenticatedUser.role,
                }
            }));
        } catch (error) {
            mapErrorToHttpResponse(response, error);
        }
    }

    public async getAllUsers(request: Request, response: Response) {
        try {
            const getAllUsers = new GetAllUsers(this.userRepository);
            const users = await getAllUsers.execute();
            mapSuccessToHttpResponse(response, new OkSuccess(undefined, { users }));
        } catch (error) {
            mapErrorToHttpResponse(response, error);
        }
    }
}