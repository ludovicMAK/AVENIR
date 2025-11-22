import { RegisterUser } from "@application/usecases/registerUser"
import { GetAllUsers } from "@application/usecases/getAllUsers"
import { LoginUser } from "@application/usecases/loginUser"
import { RegisterUserInput, LoginUserInput } from "@application/requests/auth"
import { User } from "@domain/entities/users"

export class UserController {
    public constructor(
        private readonly registerUser: RegisterUser,
        private readonly loginUser: LoginUser,
        private readonly getAllUsers: GetAllUsers,
    ) {}

    public async register(payload: RegisterUserInput): Promise<void> {
        await this.registerUser.execute(payload)
    }

    public async login(payload: LoginUserInput): Promise<User> {
        return this.loginUser.execute(payload)
    }

    public async list(): Promise<User[]> {
        return this.getAllUsers.execute()
    }
}