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

export type AccountResponseData = { accounts: AccountView[] };

export type SingleAccountResponseData = { account: AccountView };

export type UserResponseData = { user: UserView };

export type UserListResponseData = { users: UserView[] };

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

export type ConversationResponseData = { conversation: ConversationView };

export type ConversationsListResponseData = {
  conversations: ConversationView[];
};

export type MessageResponseData = { message: MessageView };

export type MessagesListResponseData = { messages: MessageView[] };

export type SuccessData =
  | UserResponseData
  | UserListResponseData
  | AccountResponseData
  | SingleAccountResponseData
  | ConversationResponseData
  | ConversationsListResponseData
  | MessageResponseData
  | MessagesListResponseData
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
