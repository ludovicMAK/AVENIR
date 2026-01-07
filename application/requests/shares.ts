import { OrderDirection } from "@domain/values/orderDirection";
import { OrderValidity } from "@domain/values/orderValidity";

export type CreateShareInput = {
  name: string;
  totalNumberOfParts: number;
  initialPrice: number;
};

export type PlaceOrderInput = {
  customerId: string;
  shareId: string;
  direction: OrderDirection;
  quantity: number;
  priceLimit: number;
  validity: OrderValidity;
};

export type CancelOrderInput = {
  orderId: string;
  customerId: string;
};

export type GetPositionsInput = {
  customerId: string;
};

export type GetShareInput = {
  shareId: string;
};

export type TransferToTradingAccountInput = {
  customerId: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
};

export type GetShareTransactionHistoryInput = {
  shareId: string;
};

export type GetOrderBookInput = {
  shareId: string;
};

export type CalculateSharePriceInput = {
  shareId: string;
};

export type ExecuteMatchingOrdersInput = {
  shareId: string;
};
