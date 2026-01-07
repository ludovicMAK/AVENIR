// Users use cases
import { RegisterUser } from "@application/usecases/users/registerUser";
import { LoginUser } from "@application/usecases/users/loginUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";

// Accounts use cases
import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseOwnAccount } from "@application/usecases/accounts/closeOwnAccount";

// Shares use cases
import { CreateShare } from "@application/usecases/shares/createShare";
import { GetAllShares } from "@application/usecases/shares/getAllShares";
import { GetShareById } from "@application/usecases/shares/getShareById";
import { PlaceOrder } from "@application/usecases/shares/placeOrder";
import { CancelOrder } from "@application/usecases/shares/cancelOrder";
import { GetClientPositions } from "@application/usecases/shares/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/shares/getOrdersByCustomer";



// Conversations use cases
import { CreateConversation } from "@application/usecases/conversations/createConversation";
import { CreateGroupConversation } from "@application/usecases/conversations/createGroupConversation";
import { SendMessage } from "@application/usecases/conversations/sendMessage";
import { TransferConversationUseCase } from "@application/usecases/conversations/transferConversation";
import { CloseConversation } from "@application/usecases/conversations/closeConversation";
import { GetConversationMessages } from "@application/usecases/conversations/getConversationMessages";
import { GetCustomerConversations } from "@application/usecases/conversations/getCustomerConversations";
import { GetAdvisorConversations } from "@application/usecases/conversations/getAdvisorConversations";
import { AddParticipant } from "@application/usecases/conversations/addParticipant";
import {
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  shareRepository,
  orderRepository,
  shareTransactionRepository,
  securitiesPositionRepository,
  transactionRepository,
  transferRepository,
  unitOfWork,
  sessionRepository,
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  transferConversationRepository,
  creditRepository,
  dueDateRepository,
} from "@express/src/config/repositories";
import {
  emailSender,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  ibanGenerator,
  nodeGenerateAmortizationService,
} from "@express/src/config/services";
import { UserController } from "@express/controllers/UserController";
import { AccountController } from "@express/controllers/AccountController";
import { ShareController } from "@express/controllers/ShareController";
import { ConversationController } from "@express/controllers/ConversationController";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";
import { ConversationHttpHandler } from "@express/src/http/ConversationHttpHandler";
import { createHttpRouter } from "@express/src/routes/index";
import { TransactionHttpHandler } from "../http/TransactionHttpHandler";
import { TransactionController } from "@express/controllers/TansactionController";
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { TransferHttpHandler } from "../http/TransferHttpHandler";
import { TransferController } from "@express/controllers/TransferController";
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";
import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
import { CreditHttpHandler } from "../http/CreditHttpHandler";
import { CreditController } from "@express/controllers/CreditController";
import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCustomerCreditsWithDueDates } from "@application/usecases/credits/getCustomerCreditsWithDueDates";
import { GetMyCredits } from "@application/usecases/credits/getMyCredits";
import { GetCreditStatus } from "@application/usecases/credits/getCreditStatus";
import { SimulateAmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { EnvironmentBankConfiguration } from "@adapters/services/EnvironmentBankConfiguration";

const registerUser = new RegisterUser(
  userRepository,
  emailConfirmationTokenRepository,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  emailSender
);
const loginUser = new LoginUser(
  userRepository,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  sessionRepository
);
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
  sessionRepository,
  accountRepository,
  uuidGenerator,
  ibanGenerator
);
const getAccountById = new GetAccountById(accountRepository);
const closeOwnAccount = new CloseOwnAccount(
  accountRepository,
  sessionRepository
);
const updateNameAccount = new UpdateNameAccount(
  sessionRepository,
  accountRepository
);
const accountController = new AccountController(
  getAccountsFromOwnerId,
  createAccount,
  getAccountById,
  closeOwnAccount,
  updateNameAccount
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
const createTransaction = new CreateTransaction(
  transactionRepository,
  uuidGenerator,
  transferRepository,
  accountRepository,
  unitOfWork,
  sessionRepository
);

const validateTransferByAdmin = new ValidTransferByAdmin(
  transactionRepository,
  transferRepository,
  userRepository,
  unitOfWork,
  accountRepository
);
const transactionController = new TransactionController(createTransaction);
const transferController = new TransferController(validateTransferByAdmin);

const createConversation = new CreateConversation(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined 
);
const createGroupConversation = new CreateGroupConversation(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);
const sendMessage = new SendMessage(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);
const transferConversation = new TransferConversationUseCase(
  conversationRepository,
  participantConversationRepository,
  transferConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);
const closeConversation = new CloseConversation(
  conversationRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  undefined
);
const getConversationMessages = new GetConversationMessages(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository
);
const getCustomerConversations = new GetCustomerConversations(
  conversationRepository,
  sessionRepository,
  userRepository
);
const getAdvisorConversations = new GetAdvisorConversations(
  conversationRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository
);

const addParticipant = new AddParticipant(
  conversationRepository,
  participantConversationRepository,
  userRepository,
  sessionRepository,
  uuidGenerator,
  undefined
);

const conversationController = new ConversationController(
  createConversation,
  createGroupConversation,
  sendMessage,
  transferConversation,
  closeConversation,
  getConversationMessages,
  getCustomerConversations,
  getAdvisorConversations,
  addParticipant
);

const userHttpHandler = new UserHttpHandler(userController);
const accountHttpHandler = new AccountHttpHandler(accountController);
const shareHttpHandler = new ShareHttpHandler(shareController);
const transactionHttpHandler = new TransactionHttpHandler(
  transactionController
);
const transferHttpHandler = new TransferHttpHandler(transferController);
const conversationHttpHandler = new ConversationHttpHandler(
  conversationController
);
const grantCredit = new GrantCredit(
  sessionRepository,
  userRepository,
  accountRepository,
  creditRepository,
  dueDateRepository,
  nodeGenerateAmortizationService,
  unitOfWork,
  uuidGenerator
);
const getCustomerCreditsWithDueDatesUsecase = new GetCustomerCreditsWithDueDates(
  userRepository,
  creditRepository,
  dueDateRepository
);
const getMyCreditsUsecase = new GetMyCredits(
  sessionRepository,
  creditRepository,
  dueDateRepository
);
const getCreditStatusUsecase = new GetCreditStatus(
  sessionRepository,
  creditRepository,
  dueDateRepository
);
const bankConfiguration = new EnvironmentBankConfiguration();
const simulateAmortizationScheduleUsecase = new SimulateAmortizationSchedule(
  nodeGenerateAmortizationService
);
const payInstallmentUsecase = new PayInstallment(
  sessionRepository,
  dueDateRepository,
  accountRepository,
  transactionRepository,
  transferRepository,
  creditRepository,
  unitOfWork,
  uuidGenerator,
  bankConfiguration
);



const creditController = new CreditController(grantCredit, getCustomerCreditsWithDueDatesUsecase, getMyCreditsUsecase, getCreditStatusUsecase, simulateAmortizationScheduleUsecase, payInstallmentUsecase);
const creditHttpHandler = new CreditHttpHandler(creditController);

export const httpRouter = createHttpRouter(
  userHttpHandler,
  accountHttpHandler,
  shareHttpHandler,
  transactionHttpHandler,
  transferHttpHandler,
  conversationHttpHandler,
  creditHttpHandler
);

export {
  conversationController,
  createConversation,
  createGroupConversation,
  sendMessage,
  transferConversation,
  closeConversation,
  addParticipant,
};
