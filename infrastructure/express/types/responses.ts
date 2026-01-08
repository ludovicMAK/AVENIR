import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";
import { AmortizationSchedule } from "@domain/types/AmortizationSchedule";
import { CreditStatusData } from "@domain/types/CreditStatusData";
import { CreditWithDueDates } from "@domain/types/CreditWithDueDates";
import { MarkOverdueResult } from "@domain/types/MarkOverdueResult";
import { OverdueDueDateWithCredit } from "@domain/types/OverdueDueDateWithCredit";
import { PaymentHistoryItem } from "@domain/types/PaymentHistoryItem";
import { TransactionHistoryResult } from "@domain/types/TransferHistoryResult";
import { DailyInterestDto, SavingsRateDto } from "./savings";

export type UserView = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
};

export type AccountView = {
  id: string;
  IBAN: string;
  accountType: string;
  accountName: string;
  authorizedOverdraft: boolean;
  overdraftLimit: number;
  overdraftFees: number;
  status: string;
  balance: number;
  idOwner: string;
};
export type CreditView = {
  id: string;
  amountBorrowed: number;
  annualRate: number;
  insuranceRate: number;
  durationInMonths: number;
  startDate: Date;
  status: string;
  customerId: string;
  monthlyPayment: number;
  totalAmountToPay: number;
  loanCost: number;
};

export type CreditResponseData = { credit: Credit };

export type CreditsResponseData = { credits: Credit[] };

export type AccountResponseData = { accounts: AccountView[] };

export type SingleAccountResponseData = { account: AccountView };

export type UserResponseData = { user: UserView };

export type UserListResponseData = { users: UserView[] };

export type UserRegistrationResponseData = { userId: string };

export type SavingsRateResponseData = { rate: SavingsRateDto };

export type SavingsRateHistoryResponseData = { rates: SavingsRateDto[] };

export type creditsWithDueDatesData = {
  creditWithDueDates: CreditWithDueDates[];
};

export type SerializedDueDate = {
  id: string;
  creditId: string;
  dueDate: Date;
  amountDue: number;
  principal: number;
  interest: number;
  insurance: number;
  status: string;
  paidDate?: Date;
  paidAmount?: number;
};

export type SerializedCreditWithDueDates = {
  id: string;
  customerId: string;
  advisorId: string;
  accountId: string;
  amountBorrowed: number;
  annualRate: number;
  insuranceRate: number;
  durationInMonths: number;
  monthlyPayment: number;
  status: string;
  dateGranted: Date;
  totalAmountDue: number;
  totalPaid: number;
  remainingAmount: number;
  dueDates: SerializedDueDate[];
};

export type CreditsWithDueDatesResponseData = {
  credits: SerializedCreditWithDueDates[];
};

export type SerializedCreditsWithDueDatesData = {
  creditWithDueDates: SerializedCreditWithDueDates[];
};

export type DueDatesResponseData = {
  dueDates: SerializedDueDate[];
};

export type ConversationView = {
  id: string;
  status: string;
  type: string;
  dateOuverture: Date;
  customerId: string | null;
};

export type MessageView = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  text: string;
  sendDate: Date;
};
export type OverdueDueDateWithCreditData = {
  overdueDueDates: OverdueDueDateWithCredit[];
};
export type AmortizationScheduleResponseData = {
  schedule: AmortizationSchedule;
};

export type ConversationResponseData = { conversation: ConversationView };

export type ConversationsListResponseData = {
  conversations: ConversationView[];
};
export type CreditStatusResponseData = { creditStatusData: CreditStatusData };
export type DueDateResponseData = { dueDate: DueDate };

export type MessageResponseData = { message: MessageView };

export type MessagesListResponseData = { messages: MessageView[] };
export type PaymentHistoryItemData = {
  payments: PaymentHistoryItem[];
};

export type ShareView = {
  id: string;
  name: string;
  totalNumberOfParts: number;
  initialPrice: number;
  lastExecutedPrice: number | null;
};

export type ShareResponseData = { id: string; share: ShareView };
export type ShareUpdateResponseData = { share: ShareView };
export type ShareDeleteResponseData = Record<string, never>;

export type OrderResponseData = { orderId: string };

export type SuccessData =
  | UserResponseData
  | UserListResponseData
  | UserRegistrationResponseData
  | SavingsRateResponseData
  | SavingsRateHistoryResponseData
  | AccountResponseData
  | SingleAccountResponseData
  | ConversationResponseData
  | ConversationsListResponseData
  | MessageResponseData
  | MessagesListResponseData
  | CreditResponseData
  | CreditsResponseData
  | DueDateResponseData
  | DueDatesResponseData
  | AmortizationScheduleResponseData
  | creditsWithDueDatesData
  | CreditsWithDueDatesResponseData
  | SerializedCreditsWithDueDatesData
  | CreditStatusResponseData
  | PaymentHistoryItemData
  | AccountInterestHistoryResponseData
  | ProcessDailyInterestResponseData
  | MarkOverdueResult
  | OverdueDueDateWithCreditData
  | TransactionHistoryResult
  | ShareResponseData
  | ShareUpdateResponseData
  | ShareDeleteResponseData
  | OrderResponseData
  | undefined;

export type SuccessPayload<ResponseData extends SuccessData = SuccessData> = {
  status: number;
  code: string;
  message?: string;
  data?: ResponseData;
};

export type SuccessOptions<ResponseData extends SuccessData = SuccessData> = {
  status?: number;
  code: string;
  message?: string;
  data?: ResponseData;
  headers?: Record<string, string>;
};
