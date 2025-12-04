import { RegisterUser } from "@application/usecases/registerUser"
import { LoginUser } from "@application/usecases/loginUser"
import { GetAllUsers } from "@application/usecases/getAllUsers"
import { ConfirmRegistration } from "@application/usecases/confirmRegistration"
import { userRepository, emailConfirmationTokenRepository, accountRepository,transactionRepository,transferRepository } from "@express/src/config/repositories"
import { emailSender, passwordHasher, uuidGenerator, tokenGenerator, ibanGenerator } from "@express/src/config/services"
import { UserController } from "@express/controllers/UserController"
import { AccountController } from "@express/controllers/AccountController"
import { UserHttpHandler } from "@express/src/http/UserHttpHandler"
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler"
import { GetAccountsFromOwnerId } from "@application/usecases/getAccountsFromOwnerId"
import { createHttpRouter } from "@express/src/routes"
import { TransactionHttpHandler } from "../http/TransactionHttpHandler"
import { TransactionController } from "@express/controllers/TansactionController"

import { create } from "domain"
import { CreateTransaction } from "@application/usecases/createTransaction"
import { tr } from "zod/v4/locales"

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
const createTransactionUsecase = new CreateTransaction(transactionRepository,uuidGenerator,transferRepository,accountRepository);
const transactionController = new TransactionController(createTransactionUsecase)
const transactionHttpHandler = new TransactionHttpHandler(transactionController)

export const httpRouter = createHttpRouter(userHttpHandler, accountHttpHandler, transactionHttpHandler)