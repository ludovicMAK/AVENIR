import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";
import { AmortizationSchedule } from "@domain/types/AmortizationSchedule";
import { CreditStatusData } from "@domain/types/CreditStatusData";
import { CreditWithDueDates } from "@domain/types/CreditWithDueDates";
import { MarkOverdueResult } from "@domain/types/MarkOverdueResult";
import { OverdueDueDateWithCredit } from "@domain/types/OverdueDueDateWithCredit";
import { PaymentHistoryItem } from "@domain/types/PaymentHistoryItem";
import { TransactionHistoryResult } from "@domain/types/TransferHistoryResult";


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

export type creditsWithDueDatesData = {
  creditWithDueDates: CreditWithDueDates[];
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
export type OverdueDueDateWithCreditData = { overdueDueDates: OverdueDueDateWithCredit[] };
export type AmortizationScheduleResponseData = { schedule: AmortizationSchedule };

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
}

export type SuccessData =
  | UserResponseData
  | UserListResponseData
  | UserRegistrationResponseData
  | AccountResponseData
  | SingleAccountResponseData
  | ConversationResponseData
  | ConversationsListResponseData
  | MessageResponseData
  | MessagesListResponseData
  | CreditResponseData
  | CreditsResponseData
  | DueDateResponseData
  | AmortizationScheduleResponseData
  |creditsWithDueDatesData
  | CreditStatusResponseData
  | PaymentHistoryItemData
  | MarkOverdueResult
  | OverdueDueDateWithCreditData
  | TransactionHistoryResult
  | undefined;

export type SuccessPayload<ResponseData extends SuccessData = SuccessData> = {
  ok: true;
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
