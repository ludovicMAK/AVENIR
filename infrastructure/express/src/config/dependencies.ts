import { RegisterUser } from "@application/usecases/users/registerUser";
import { LoginUser } from "@application/usecases/users/loginUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { GetAllUsersWithStats } from "@application/usecases/users/getAllUsersWithStats";
import { GetUserById } from "@application/usecases/users/getUserById";
import { GetUserByToken } from "@application/usecases/users/getUserByToken";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";
import { BanUser } from "@application/usecases/users/banUser";
import { UnbanUser } from "@application/usecases/users/unbanUser";
import { DeleteUser } from "@application/usecases/users/deleteUser";

import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseOwnAccount } from "@application/usecases/accounts/closeOwnAccount";
import { GetAccountBalance } from "@application/usecases/accounts/getAccountBalance";
import { GetAccountTransactions } from "@application/usecases/accounts/getAccountTransactions";
import { GetAccountStatement } from "@application/usecases/accounts/getAccountStatement";

import { CreateShare } from "@application/usecases/shares/createShare";
import { GetAllShares } from "@application/usecases/shares/getAllShares";
import { GetShareById } from "@application/usecases/shares/getShareById";
import { PlaceOrder } from "@application/usecases/shares/placeOrder";
import { CancelOrder } from "@application/usecases/shares/cancelOrder";
import { GetClientPositions } from "@application/usecases/shares/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/shares/getOrdersByCustomer";
import { ExecuteMatchingOrders } from "@application/usecases/shares/executeMatchingOrders";
import { CalculateSharePrice } from "@application/usecases/shares/calculateSharePrice";
import { GetOrderBook } from "@application/usecases/shares/getOrderBook";
import { GetShareTransactionHistory } from "@application/usecases/shares/getShareTransactionHistory";
import { UpdateShare } from "@application/usecases/shares/updateShare";
import { DeleteShare } from "@application/usecases/shares/deleteShare";
import { ActivateShare } from "@application/usecases/shares/activateShare";
import { DeactivateShare } from "@application/usecases/shares/deactivateShare";

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
  unitOfWorkFactory,
  sessionRepository,
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  transferConversationRepository,
  creditRepository,
  dueDateRepository,
  savingsRateRepository,
  dailyInterestRepository,
  notificationRepository,
  activityRepository,
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
import { CancelTransfer } from "@application/usecases/transfer/cancelTransfer";
import { GetTransferHistory } from "@application/usecases/transfer/getTransferHistory";

import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
import { CreditHttpHandler } from "../http/CreditHttpHandler";
import { CreditController } from "@express/controllers/CreditController";
import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCustomerCreditsWithDueDates } from "@application/usecases/credits/getCustomerCreditsWithDueDates";
import { GetMyCredits } from "@application/usecases/credits/getMyCredits";
import { GetCreditStatus } from "@application/usecases/credits/getCreditStatus";
import { GetPaymentHistory } from "@application/usecases/credits/getPaymentHistory";
import { GetCreditDueDates } from "@application/usecases/credits/getCreditDueDates";
import { EarlyRepayCredit } from "@application/usecases/credits/earlyRepayCredit";
import { MarkOverdueDueDates } from "@application/usecases/credits/markOverdueDueDates";
import { GetOverdueDueDates } from "@application/usecases/credits/getOverdueDueDates";
import { SimulateAmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { EnvironmentBankConfiguration } from "@adapters/services/EnvironmentBankConfiguration";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";
import { GetAccountTransactionsByAdmin } from "@application/usecases/transactions/getAccountTransactionsByAdmin";
import { UpdateSavingsRate } from "@application/usecases/savings/updateSavingsRate";
import { GetSavingsRateHistory } from "@application/usecases/savings/getSavingsRateHistory";
import { GetActiveSavingsRate } from "@application/usecases/savings/getActiveSavingsRate";
import { ProcessDailySavingsInterest } from "@application/usecases/savings/processDailySavingsInterest";
import { GetAccountInterestHistory } from "@application/usecases/savings/getAccountInterestHistory";
import { SavingsController } from "@express/controllers/SavingsController";
import { SavingsHttpHandler } from "../http/SavingsHttpHandler";
import { AuthenticateUser } from "@application/usecases/auth/authenticateUser";
import { AuthGuard } from "@express/src/http/AuthGuard";

// Notifications & Activities Use Cases
import { SendNotificationToClient } from "@application/usecases/notifications/SendNotificationToClient";
import { GetNotificationsForClient } from "@application/usecases/notifications/GetNotificationsForClient";
import { MarkNotificationAsRead } from "@application/usecases/notifications/MarkNotificationAsRead";
import { GetUnreadNotificationCount } from "@application/usecases/notifications/GetUnreadNotificationCount";
import { DeleteNotification } from "@application/usecases/notifications/DeleteNotification";

import { CreateActivity } from "@application/usecases/activities/CreateActivity";
import { GetActivities } from "@application/usecases/activities/GetActivities";
import { GetActivityById } from "@application/usecases/activities/GetActivityById";
import { UpdateActivity } from "@application/usecases/activities/UpdateActivity";
import { DeleteActivity } from "@application/usecases/activities/DeleteActivity";
import { GetRecentActivities } from "@application/usecases/activities/GetRecentActivities";

// Notifications & Activities Controllers & Handlers
import { NotificationController } from "@express/controllers/NotificationController";
import { ActivityController } from "@express/controllers/ActivityController";
import { NotificationHttpHandler } from "@express/src/http/NotificationHttpHandler";
import { ActivityHttpHandler } from "@express/src/http/ActivityHttpHandler";

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
const getAllUsersWithStats = new GetAllUsersWithStats(
  userRepository,
  accountRepository
);
const getUserById = new GetUserById(userRepository);
const getUserByToken = new GetUserByToken(userRepository, sessionRepository);
const confirmRegistration = new ConfirmRegistration(
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  ibanGenerator,
  uuidGenerator
);
const banUser = new BanUser(userRepository);
const unbanUser = new UnbanUser(userRepository);
const deleteUserUsecase = new DeleteUser(
  userRepository,
  accountRepository,
  orderRepository,
  securitiesPositionRepository,
  shareTransactionRepository
);

const userController = new UserController(
  registerUser,
  loginUser,
  getAllUsers,
  getAllUsersWithStats,
  confirmRegistration,
  getUserById,
  getUserByToken,
  banUser,
  unbanUser,
  deleteUserUsecase
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
const getAccountBalance = new GetAccountBalance(
  accountRepository,
  sessionRepository
);
const getAccountTransactions = new GetAccountTransactions(
  accountRepository,
  transactionRepository,
  sessionRepository
);
const getAccountStatement = new GetAccountStatement(
  accountRepository,
  transactionRepository,
  sessionRepository
);
const accountController = new AccountController(
  getAccountsFromOwnerId,
  createAccount,
  getAccountById,
  closeOwnAccount,
  updateNameAccount,
  getAccountBalance,
  getAccountTransactions,
  getAccountStatement
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
const executeMatchingOrders = new ExecuteMatchingOrders(
  orderRepository,
  shareTransactionRepository,
  securitiesPositionRepository,
  accountRepository,
  shareRepository,
  uuidGenerator,
  unitOfWorkFactory
);
const calculateSharePrice = new CalculateSharePrice(orderRepository);
const getOrderBook = new GetOrderBook(orderRepository);
const getShareTransactionHistory = new GetShareTransactionHistory(
  shareTransactionRepository
);
const updateShare = new UpdateShare(shareRepository);
const deleteShareUsecase = new DeleteShare(
  shareRepository,
  orderRepository,
  securitiesPositionRepository
);
const activateShare = new ActivateShare(shareRepository);
const deactivateShare = new DeactivateShare(shareRepository, orderRepository);

const shareController = new ShareController(
  createShare,
  getAllShares,
  getShareById,
  placeOrder,
  cancelOrder,
  getClientPositions,
  getOrdersByCustomer,
  executeMatchingOrders,
  calculateSharePrice,
  getOrderBook,
  getShareTransactionHistory,
  updateShare,
  deleteShareUsecase,
  activateShare,
  deactivateShare
);
const createTransaction = new CreateTransaction(
  transactionRepository,
  uuidGenerator,
  transferRepository,
  accountRepository,
  unitOfWorkFactory,
  sessionRepository
);

const validateTransferByAdmin = new ValidTransferByAdmin(
  transactionRepository,
  transferRepository,
  userRepository,
  unitOfWorkFactory,
  accountRepository
);

const cancelTransferUsecase = new CancelTransfer(
  transferRepository,
  userRepository,
  transactionRepository,
  accountRepository,
  unitOfWorkFactory
);

const getTransferHistoryUsecase = new GetTransferHistory(transferRepository);

const getTransactionHistoryUsecase = new GetTransactionHistory(
  sessionRepository,
  transactionRepository,
  accountRepository
);

const getAccountTransactionsByAdminUsecase = new GetAccountTransactionsByAdmin(
  transactionRepository,
  userRepository,
  accountRepository
);

const transactionController = new TransactionController(
  createTransaction,
  getTransactionHistoryUsecase,
  getAccountTransactionsByAdminUsecase
);
const transferController = new TransferController(
  validateTransferByAdmin,
  cancelTransferUsecase,
  getTransferHistoryUsecase
);

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

const grantCredit = new GrantCredit(
  sessionRepository,
  userRepository,
  accountRepository,
  creditRepository,
  dueDateRepository,
  nodeGenerateAmortizationService,
  unitOfWorkFactory,
  uuidGenerator
);
const getCustomerCreditsWithDueDatesUsecase =
  new GetCustomerCreditsWithDueDates(
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
const getPaymentHistoryUsecase = new GetPaymentHistory(
  sessionRepository,
  creditRepository,
  dueDateRepository
);
const getCreditDueDatesUsecase = new GetCreditDueDates(
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
  unitOfWorkFactory,
  uuidGenerator,
  bankConfiguration
);
const earlyRepayCreditUsecase = new EarlyRepayCredit(
  sessionRepository,
  dueDateRepository,
  accountRepository,
  transactionRepository,
  transferRepository,
  creditRepository,
  unitOfWorkFactory,
  uuidGenerator,
  bankConfiguration
);
const markOverdueDueDatesUsecase = new MarkOverdueDueDates(
  sessionRepository,
  userRepository,
  dueDateRepository,
  unitOfWorkFactory
);
const getOverdueDueDatesUsecase = new GetOverdueDueDates(
  sessionRepository,
  userRepository,
  dueDateRepository,
  creditRepository
);

const authenticateUserUsecase = new AuthenticateUser(
  sessionRepository,
  userRepository
);
const authGuard = new AuthGuard(authenticateUserUsecase);

const creditController = new CreditController(
  grantCredit,
  getCustomerCreditsWithDueDatesUsecase,
  getMyCreditsUsecase,
  getCreditStatusUsecase,
  getPaymentHistoryUsecase,
  getCreditDueDatesUsecase,
  earlyRepayCreditUsecase,
  markOverdueDueDatesUsecase,
  getOverdueDueDatesUsecase,
  simulateAmortizationScheduleUsecase,
  payInstallmentUsecase
);
const creditHttpHandler = new CreditHttpHandler(creditController, authGuard);

const updateSavingsRateUsecase = new UpdateSavingsRate(
  savingsRateRepository,
  uuidGenerator
);
const getSavingsRateHistoryUsecase = new GetSavingsRateHistory(
  savingsRateRepository
);
const getActiveSavingsRateUsecase = new GetActiveSavingsRate(
  savingsRateRepository
);
const processDailySavingsInterestUsecase = new ProcessDailySavingsInterest(
  savingsRateRepository,
  dailyInterestRepository,
  accountRepository,
  transactionRepository,
  uuidGenerator,
  unitOfWorkFactory
);
const getAccountInterestHistoryUsecase = new GetAccountInterestHistory(
  dailyInterestRepository,
  accountRepository
);

const savingsController = new SavingsController(
  updateSavingsRateUsecase,
  getSavingsRateHistoryUsecase,
  getActiveSavingsRateUsecase,
  processDailySavingsInterestUsecase,
  getAccountInterestHistoryUsecase
);
const savingsHttpHandler = new SavingsHttpHandler(savingsController, authGuard);

// Notifications Use Cases & Controller
const sendNotificationToClientUsecase = new SendNotificationToClient(
  notificationRepository,
  userRepository,
  uuidGenerator
);
const getNotificationsForClientUsecase = new GetNotificationsForClient(
  notificationRepository,
  userRepository
);
const markNotificationAsReadUsecase = new MarkNotificationAsRead(
  notificationRepository
);
const getUnreadNotificationCountUsecase = new GetUnreadNotificationCount(
  notificationRepository
);
const deleteNotificationUsecase = new DeleteNotification(notificationRepository);

const notificationController = new NotificationController(
  sendNotificationToClientUsecase,
  getNotificationsForClientUsecase,
  markNotificationAsReadUsecase,
  getUnreadNotificationCountUsecase,
  deleteNotificationUsecase
);
const notificationHttpHandler = new NotificationHttpHandler(
  notificationController,
  authGuard
);

// Activities Use Cases & Controller
const createActivityUsecase = new CreateActivity(
  activityRepository,
  userRepository,
  uuidGenerator
);
const getActivitiesUsecase = new GetActivities(
  activityRepository,
  userRepository
);
const getActivityByIdUsecase = new GetActivityById(
  activityRepository,
  userRepository
);
const updateActivityUsecase = new UpdateActivity(
  activityRepository,
  userRepository
);
const deleteActivityUsecase = new DeleteActivity(activityRepository);
const getRecentActivitiesUsecase = new GetRecentActivities(
  activityRepository,
  userRepository
);

const activityController = new ActivityController(
  createActivityUsecase,
  getActivitiesUsecase,
  getActivityByIdUsecase,
  updateActivityUsecase,
  deleteActivityUsecase,
  getRecentActivitiesUsecase
);
const activityHttpHandler = new ActivityHttpHandler(
  activityController,
  authGuard
);

const userHttpHandler = new UserHttpHandler(userController, authGuard);
const accountHttpHandler = new AccountHttpHandler(
  accountController,
  transactionRepository,
  authGuard
);
const shareHttpHandler = new ShareHttpHandler(shareController, authGuard);
const transactionHttpHandler = new TransactionHttpHandler(
  transactionController,
  transactionRepository,
  authGuard
);
const transferHttpHandler = new TransferHttpHandler(
  transferController,
  authGuard
);
const conversationHttpHandler = new ConversationHttpHandler(
  conversationController,
  authGuard
);

export const httpRouter = createHttpRouter(
  userHttpHandler,
  accountHttpHandler,
  shareHttpHandler,
  transactionHttpHandler,
  transferHttpHandler,
  conversationHttpHandler,
  creditHttpHandler,
  savingsHttpHandler,
  notificationHttpHandler,
  activityHttpHandler
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
