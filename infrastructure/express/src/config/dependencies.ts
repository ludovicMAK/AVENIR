// Users use cases
import { RegisterUser } from "@application/usecases/users/registerUser";
import { LoginUser } from "@application/usecases/users/loginUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";

// Accounts use cases
import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseAccount } from "@application/usecases/accounts/closeAccount";

// Shares use cases
import { CreateShare } from "@application/usecases/shares/createShare";
import { GetAllShares } from "@application/usecases/shares/getAllShares";
import { GetShareById } from "@application/usecases/shares/getShareById";
import { PlaceOrder } from "@application/usecases/shares/placeOrder";
import { CancelOrder } from "@application/usecases/shares/cancelOrder";
import { GetClientPositions } from "@application/usecases/shares/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/shares/getOrdersByCustomer";
import {
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  shareRepository,
  orderRepository,
  shareTransactionRepository,
  securitiesPositionRepository,
  transactionRepository,
  transferRepository
} from "@express/src/config/repositories";
import {
  emailSender,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  ibanGenerator,
} from "@express/src/config/services";
import { UserController } from "@express/controllers/UserController";
import { AccountController } from "@express/controllers/AccountController";
import { ShareController } from "@express/controllers/ShareController";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";
import { createHttpRouter } from "@express/src/routes/index";
import { TransactionHttpHandler } from "../http/TransactionHttpHandler";
import { TransactionController } from "@express/controllers/TansactionController";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";

const registerUser = new RegisterUser(
  userRepository,
  emailConfirmationTokenRepository,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  emailSender
);
const loginUser = new LoginUser(userRepository, passwordHasher);
const getAllUsers = new GetAllUsers(userRepository);
const confirmRegistration = new ConfirmRegistration(
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  ibanGenerator,
  uuidGenerator
);

const userController = new UserController(
  registerUser,
  loginUser,
  getAllUsers,
  confirmRegistration
);
const getAccountsFromOwnerId = new GetAccountsFromOwnerId(accountRepository);
const createAccount = new CreateAccount(
  accountRepository,
  uuidGenerator,
  ibanGenerator
);
const getAccountById = new GetAccountById(accountRepository);
const closeAccount = new CloseAccount(accountRepository);
const accountController = new AccountController(
  getAccountsFromOwnerId,
  createAccount,
  getAccountById,
  closeAccount
);

const createShare = new CreateShare(shareRepository, uuidGenerator);
const getAllShares = new GetAllShares(shareRepository);
const getShareById = new GetShareById(shareRepository);
const placeOrder = new PlaceOrder(
  orderRepository,
  shareRepository,
  securitiesPositionRepository,
  accountRepository,
  uuidGenerator
);
const cancelOrder = new CancelOrder(orderRepository);
const getClientPositions = new GetClientPositions(securitiesPositionRepository);
const getOrdersByCustomer = new GetOrdersByCustomer(orderRepository);

const shareController = new ShareController(
  createShare,
  getAllShares,
  getShareById,
  placeOrder,
  cancelOrder,
  getClientPositions,
  getOrdersByCustomer
);
const createTransaction = new CreateTransaction(transactionRepository, uuidGenerator, transferRepository, accountRepository);
const transactionController = new TransactionController(createTransaction);

const userHttpHandler = new UserHttpHandler(userController);
const accountHttpHandler = new AccountHttpHandler(accountController);
const shareHttpHandler = new ShareHttpHandler(shareController);
const transactionHttpHandler = new TransactionHttpHandler(transactionController);

export const httpRouter = createHttpRouter(
  userHttpHandler,
  accountHttpHandler,
  shareHttpHandler,
  transactionHttpHandler,
);
