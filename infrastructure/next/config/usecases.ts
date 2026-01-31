import { RegisterUser } from "@application/usecases/users/registerUser";
import { LoginUser } from "@application/usecases/users/loginUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";
import { BanUser } from "@application/usecases/users/banUser";
import { UnbanUser } from "@application/usecases/users/unbanUser";
import { DeleteUser } from "@application/usecases/users/deleteUser";
import { GetAllUsersWithStats } from "@application/usecases/users/getAllUsersWithStats";
import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseOwnAccount } from "@application/usecases/accounts/closeOwnAccount";
import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
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
import { CreateTransaction } from "@application/usecases/transactions/createTransaction";
import { GetTransactionHistory } from "@application/usecases/transactions/getTransactionHistory";
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";
import { CancelTransfer } from "@application/usecases/transfer/cancelTransfer";
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
} from "./repositories";
import {
  emailSender,
  passwordHasher,
  uuidGenerator,
  tokenGenerator,
  ibanGenerator,
  nodeGenerateAmortizationService,
} from "./services";
import { EnvironmentBankConfiguration } from "@adapters/services/EnvironmentBankConfiguration";

const bankConfiguration = new EnvironmentBankConfiguration();

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
export const getAllUsersWithStats = new GetAllUsersWithStats(
  userRepository,
  accountRepository
);
export const banUser = new BanUser(userRepository);
export const unbanUser = new UnbanUser(userRepository);
export const deleteUserUsecase = new DeleteUser(
  userRepository,
  accountRepository,
  orderRepository,
  securitiesPositionRepository,
  shareTransactionRepository
);

export const confirmRegistration = new ConfirmRegistration(
  userRepository,
  emailConfirmationTokenRepository,
  accountRepository,
  ibanGenerator,
  uuidGenerator
);

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

export const createShare = new CreateShare(shareRepository, uuidGenerator);

export const getAllShares = new GetAllShares(shareRepository);

export const getShareById = new GetShareById(shareRepository);

export const updateShare = new UpdateShare(shareRepository);

export const deleteShare = new DeleteShare(
  shareRepository,
  orderRepository,
  securitiesPositionRepository
);

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
  unitOfWorkFactory
);

export const calculateSharePrice = new CalculateSharePrice(orderRepository);

export const getOrderBook = new GetOrderBook(orderRepository);

export const getShareTransactionHistory = new GetShareTransactionHistory(
  shareTransactionRepository
);
export const activateShare = new ActivateShare(shareRepository);
export const deactivateShare = new DeactivateShare(
  shareRepository,
  orderRepository
);

export const createTransaction = new CreateTransaction(
  transactionRepository,
  uuidGenerator,
  transferRepository,
  accountRepository,
  unitOfWorkFactory,
  sessionRepository
);

export const getTransactionHistory = new GetTransactionHistory(
  sessionRepository,
  transactionRepository,
  accountRepository
);

export const validateTransferByAdmin = new ValidTransferByAdmin(
  transactionRepository,
  transferRepository,
  userRepository,
  unitOfWorkFactory,
  accountRepository
);

export const cancelTransfer = new CancelTransfer(
  transferRepository,
  userRepository,
  transactionRepository,
  accountRepository,
  unitOfWorkFactory
);

export const grantCredit = new GrantCredit(
  sessionRepository,
  userRepository,
  accountRepository,
  creditRepository,
  dueDateRepository,
  nodeGenerateAmortizationService,
  unitOfWorkFactory,
  uuidGenerator
);

export const getCustomerCreditsWithDueDates = new GetCustomerCreditsWithDueDates(
  userRepository,
  creditRepository,
  dueDateRepository
);

export const getMyCredits = new GetMyCredits(
  sessionRepository,
  creditRepository,
  dueDateRepository,
);

export const getCreditStatus = new GetCreditStatus(
  sessionRepository,
  creditRepository,
  dueDateRepository,
);

export const getPaymentHistory = new GetPaymentHistory(
  sessionRepository,
  creditRepository,
  dueDateRepository
);

export const getCreditDueDates = new GetCreditDueDates(
  sessionRepository,
  creditRepository,
  dueDateRepository
);

export const earlyRepayCredit = new EarlyRepayCredit(
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

export const markOverdueDueDates = new MarkOverdueDueDates(
  sessionRepository,
  userRepository,
  dueDateRepository,
  unitOfWorkFactory
);

export const getOverdueDueDates = new GetOverdueDueDates(
  sessionRepository,
  userRepository,
  dueDateRepository,
  creditRepository
);

export const simulateAmortizationSchedule = new SimulateAmortizationSchedule(
  nodeGenerateAmortizationService
);

export const payInstallment = new PayInstallment(
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

export const createConversation = new CreateConversation(
  conversationRepository,
  messageRepository,
  sessionRepository,
  userRepository,
  uuidGenerator,
  undefined
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
  participantConversationRepository,
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
