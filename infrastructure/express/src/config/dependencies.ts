import { RegisterUser } from "@application/usecases/registerUser";
import { LoginUser } from "@application/usecases/loginUser";
import { GetAllUsers } from "@application/usecases/getAllUsers";
import { ConfirmRegistration } from "@application/usecases/confirmRegistration";
import { GetAccountsFromOwnerId } from "@application/usecases/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/createAccount";
import { GetAccountById } from "@application/usecases/getAccountById";
import { CloseAccount } from "@application/usecases/closeAccount";
import { CreateShare } from "@application/usecases/createShare";
import { GetAllShares } from "@application/usecases/getAllShares";
import { GetShareById } from "@application/usecases/getShareById";
import { PlaceOrder } from "@application/usecases/placeOrder";
import { CancelOrder } from "@application/usecases/cancelOrder";
import { GetClientPositions } from "@application/usecases/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/getOrdersByCustomer";
import {
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  shareRepository,
  orderRepository,
  shareTransactionRepository,
  securitiesPositionRepository,
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
  ibanGenerator
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

const userHttpHandler = new UserHttpHandler(userController);
const accountHttpHandler = new AccountHttpHandler(accountController);
const shareHttpHandler = new ShareHttpHandler(shareController);

export const httpRouter = createHttpRouter(
  userHttpHandler,
  accountHttpHandler,
  shareHttpHandler
);
