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
import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
import { GetAccountBalance } from "@application/usecases/accounts/getAccountBalance";
import { GetAccountTransactions } from "@application/usecases/accounts/getAccountTransactions";
import { GetAccountStatement } from "@application/usecases/accounts/getAccountStatement";

// Shares use cases
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

// Transactions use cases
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";

// Transfer use cases
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";

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
} from "./repositories";
import {
  emailSender,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  ibanGenerator,
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
