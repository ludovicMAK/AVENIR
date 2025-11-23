import { RegisterUser } from "@application/usecases/registerUser"
import { LoginUser } from "@application/usecases/loginUser"
import { GetAllUsers } from "@application/usecases/getAllUsers"
import { ConfirmRegistration } from "@application/usecases/confirmRegistration"
import { userRepository, emailConfirmationTokenRepository } from "@express/src/config/repositories"
import { emailSender, passwordHasher, uuidGenerator, tokenGenerator } from "@express/src/config/services"
import { UserController } from "@express/controllers/UserController"
import { UserHttpHandler } from "@express/src/http/UserHttpHandler"
import { createHttpRouter } from "@express/src/routes"

const registerUser = new RegisterUser(
    userRepository,
    emailConfirmationTokenRepository,
    passwordHasher,
    uuidGenerator,
    tokenGenerator,
    emailSender,
)
const loginUser = new LoginUser(userRepository, passwordHasher)
const getAllUsers = new GetAllUsers(userRepository)
const confirmRegistration = new ConfirmRegistration(userRepository, emailConfirmationTokenRepository)

const userController = new UserController(registerUser, loginUser, getAllUsers, confirmRegistration)
const userHttpHandler = new UserHttpHandler(userController)

export const httpRouter = createHttpRouter(userHttpHandler)