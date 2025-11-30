import { RegisterUser } from "@application/usecases/registerUser"
import { LoginUser } from "@application/usecases/loginUser"
import { GetAllUsers } from "@application/usecases/getAllUsers"
import { ConfirmRegistration } from "@application/usecases/confirmRegistration"
import { userRepository, emailConfirmationTokenRepository, accountRepository } from "@express/src/config/repositories"
import { emailSender, passwordHasher, uuidGenerator, tokenGenerator, ibanGenerator } from "@express/src/config/services"
import { UserController } from "@express/controllers/UserController"
import { AccountController } from "@express/controllers/AccountController"
import { UserHttpHandler } from "@express/src/http/UserHttpHandler"
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler"
import { GetAccountsFromOwnerId } from "@application/usecases/getAccountsFromOwnerId"
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
const confirmRegistration = new ConfirmRegistration(userRepository, emailConfirmationTokenRepository, accountRepository, ibanGenerator)

const userController = new UserController(registerUser, loginUser, getAllUsers, confirmRegistration)
const getAccountsFromOwnerId = new GetAccountsFromOwnerId(accountRepository)
const accountController = new AccountController(getAccountsFromOwnerId)
const userHttpHandler = new UserHttpHandler(userController)
const accountHttpHandler = new AccountHttpHandler(accountController)

export const httpRouter = createHttpRouter(userHttpHandler, accountHttpHandler)