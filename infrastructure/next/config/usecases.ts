// Users use cases
import { RegisterUser } from "@application/usecases/users/registerUser";
import { LoginUser } from "@application/usecases/users/loginUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { GetUserById } from "@application/usecases/users/getUserById";
import { GetUserByToken } from "@application/usecases/users/getUserByToken";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";

// Accounts use cases
import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseOwnAccount } from "@application/usecases/accounts/closeOwnAccount";
import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
import { GetAccountBalance } from "@application/usecases/accounts/getAccountBalance";
import { GetAccountTransactions } from "@application/usecases/accounts/getAccountTransactions";
import { GetAccountStatement } from "@application/usecases/accounts/getAccountStatement";

// Shares use cases
import { CreateShare } from "@application/usecases/shares/createShare";
import { GetAllShares } from "@application/usecases/shares/getAllShares";
import { GetShareById } from "@application/usecases/shares/getShareById";
import { UpdateShare } from "@application/usecases/shares/updateShare";
import { DeleteShare } from "@application/usecases/shares/deleteShare";
import { PlaceOrder } from "@application/usecases/shares/placeOrder";
import { CancelOrder } from "@application/usecases/shares/cancelOrder";
import { GetClientPositions } from "@application/usecases/shares/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/shares/getOrdersByCustomer";
import { ExecuteMatchingOrders } from "@application/usecases/shares/executeMatchingOrders";
import { CalculateSharePrice } from "@application/usecases/shares/calculateSharePrice";
import { GetOrderBook } from "@application/usecases/shares/getOrderBook";
import { GetShareTransactionHistory } from "@application/usecases/shares/getShareTransactionHistory";

// Transactions use cases
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";

// Transfer use cases
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";
import { CancelTransfer } from "@application/usecases/transfer/cancelTransfer";

// Credits use cases
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

// Repositories and services
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
} from "./repositories";
import {
  emailSender,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  ibanGenerator,
  nodeGenerateAmortizationService,
} from "./services";

// ===== Users Use Cases =====
export const registerUser = new RegisterUser(
  userRepository,
  emailConfirmationTokenRepository,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  emailSender
);

export const loginUser = new LoginUser(
  userRepository,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  sessionRepository
);

export const getAllUsers = new GetAllUsers(userRepository);

export const getUserById = new GetUserById(userRepository, sessionRepository);

export const getUserByToken = new GetUserByToken(
  userRepository,
  sessionRepository
);

export const confirmRegistration = new ConfirmRegistration(
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  ibanGenerator,
  uuidGenerator
);

// ===== Accounts Use Cases =====
export const getAccountsFromOwnerId = new GetAccountsFromOwnerId(
  accountRepository
);

export const createAccount = new CreateAccount(
  sessionRepository,
  accountRepository,
  uuidGenerator,
  ibanGenerator
);

export const getAccountById = new GetAccountById(accountRepository);

export const closeOwnAccount = new CloseOwnAccount(
  accountRepository,
  sessionRepository
);

export const updateNameAccount = new UpdateNameAccount(
  sessionRepository,
  accountRepository
);

export const getAccountBalance = new GetAccountBalance(
  accountRepository,
  sessionRepository
);

export const getAccountTransactions = new GetAccountTransactions(
  accountRepository,
  transactionRepository,
  sessionRepository
);

export const getAccountStatement = new GetAccountStatement(
  accountRepository,
  transactionRepository,
  sessionRepository
);

// ===== Shares Use Cases =====
export const createShare = new CreateShare(shareRepository, uuidGenerator);

export const getAllShares = new GetAllShares(shareRepository);

export const getShareById = new GetShareById(shareRepository);

export const updateShare = new UpdateShare(shareRepository);

export const deleteShare = new DeleteShare(shareRepository);

export const placeOrder = new PlaceOrder(
  orderRepository,
  shareRepository,
  securitiesPositionRepository,
  accountRepository,
  uuidGenerator
);

export const cancelOrder = new CancelOrder(orderRepository);

export const getClientPositions = new GetClientPositions(
  securitiesPositionRepository
);

export const getOrdersByCustomer = new GetOrdersByCustomer(orderRepository);

export const executeMatchingOrders = new ExecuteMatchingOrders(
  orderRepository,
  shareTransactionRepository,
  securitiesPositionRepository,
  accountRepository,
  shareRepository,
  uuidGenerator,
  unitOfWork
);

export const calculateSharePrice = new CalculateSharePrice(orderRepository);

export const getOrderBook = new GetOrderBook(orderRepository);

export const getShareTransactionHistory = new GetShareTransactionHistory(
  shareTransactionRepository
);

// ===== Transactions Use Cases =====
export const createTransaction = new CreateTransaction(
  transactionRepository,
  uuidGenerator,
  transferRepository,
  accountRepository,
  unitOfWork,
  sessionRepository
);

export const getTransactionHistory = new GetTransactionHistory(
  sessionRepository,
  transactionRepository
);

// ===== Transfer Use Cases =====
export const validateTransferByAdmin = new ValidTransferByAdmin(
  transactionRepository,
  transferRepository,
  userRepository,
  unitOfWork,
  accountRepository
);

export const cancelTransfer = new CancelTransfer(
  transferRepository,
  sessionRepository,
  accountRepository,
  transactionRepository,
  unitOfWork
);

// ===== Credits Use Cases =====
export const grantCredit = new GrantCredit(
  creditRepository,
  dueDateRepository,
  userRepository,
  accountRepository,
  sessionRepository,
  uuidGenerator,
  nodeGenerateAmortizationService,
  unitOfWork
);

export const getCustomerCreditsWithDueDates = new GetCustomerCreditsWithDueDates(
  creditRepository,
  dueDateRepository,
  sessionRepository
);

export const getMyCredits = new GetMyCredits(
  creditRepository,
  dueDateRepository,
  sessionRepository
);

export const getCreditStatus = new GetCreditStatus(
  creditRepository,
  dueDateRepository,
  sessionRepository
);

export const getPaymentHistory = new GetPaymentHistory(
  creditRepository,
  dueDateRepository,
  sessionRepository
);

export const getCreditDueDates = new GetCreditDueDates(
  sessionRepository,
  creditRepository,
  dueDateRepository
);

export const earlyRepayCredit = new EarlyRepayCredit(
  creditRepository,
  dueDateRepository,
  accountRepository,
  sessionRepository,
  unitOfWork
);

export const markOverdueDueDates = new MarkOverdueDueDates(
  dueDateRepository,
  creditRepository,
  unitOfWork
);

export const getOverdueDueDates = new GetOverdueDueDates(
  dueDateRepository,
  creditRepository,
  sessionRepository
);

export const simulateAmortizationSchedule = new SimulateAmortizationSchedule(
  nodeGenerateAmortizationService
);

export const payInstallment = new PayInstallment(
  creditRepository,
  dueDateRepository,
  accountRepository,
  sessionRepository,
  unitOfWork
);

// ===== Conversations Use Cases =====
export const createConversation = new CreateConversation(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined // WebSocket service can be added later if needed for Next.js
);

export const createGroupConversation = new CreateGroupConversation(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);

export const sendMessage = new SendMessage(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);

export const transferConversation = new TransferConversationUseCase(
  conversationRepository,
  participantConversationRepository,
  transferConversationRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
);

export const closeConversation = new CloseConversation(
  conversationRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository,
  undefined
);

export const getConversationMessages = new GetConversationMessages(
  conversationRepository,
  messageRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository
);

export const getCustomerConversations = new GetCustomerConversations(
  conversationRepository,
  sessionRepository,
  userRepository
);

export const getAdvisorConversations = new GetAdvisorConversations(
  conversationRepository,
  participantConversationRepository,
  sessionRepository,
  userRepository
);

export const addParticipant = new AddParticipant(
  conversationRepository,
  participantConversationRepository,
  userRepository,
  sessionRepository,
  uuidGenerator,
  undefined
);
