import { CreateShare } from "@application/usecases/shares/createShare";
import { GetAllShares } from "@application/usecases/shares/getAllShares";
import { GetShareById } from "@application/usecases/shares/getShareById";
import { PlaceOrder } from "@application/usecases/shares/placeOrder";
import { CancelOrder } from "@application/usecases/shares/cancelOrder";
import { GetClientPositions } from "@application/usecases/shares/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/shares/getOrdersByCustomer";
import { GetShareTransactionHistory } from "@application/usecases/shares/getShareTransactionHistory";
import { GetOrderBook } from "@application/usecases/shares/getOrderBook";
import { CalculateSharePrice } from "@application/usecases/shares/calculateSharePrice";
import { ExecuteMatchingOrders } from "@application/usecases/shares/executeMatchingOrders";
import {
  CreateShareInput,
  PlaceOrderInput,
  CancelOrderInput,
  GetPositionsInput,
  GetShareInput,
  GetShareTransactionHistoryInput,
  GetOrderBookInput,
  CalculateSharePriceInput,
  ExecuteMatchingOrdersInput,
} from "@application/requests/shares";
import { Share } from "@domain/entities/share";
import { Order } from "@domain/entities/order";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { OrderBookResult } from "@application/usecases/shares/getOrderBook";
import { SharePriceCalculation } from "@application/usecases/shares/calculateSharePrice";
import { ExecutionResult } from "@application/usecases/shares/executeMatchingOrders";

export class ShareController {
  constructor(
    private readonly createShare: CreateShare,
    private readonly getAllShares: GetAllShares,
    private readonly getShareById: GetShareById,
    private readonly placeOrder: PlaceOrder,
    private readonly cancelOrder: CancelOrder,
    private readonly getClientPositions: GetClientPositions,
    private readonly getOrdersByCustomer: GetOrdersByCustomer,
    private readonly getShareTransactionHistory: GetShareTransactionHistory,
    private readonly getOrderBookUseCase: GetOrderBook,
    private readonly calculateSharePrice: CalculateSharePrice,
    private readonly executeMatchingOrders: ExecuteMatchingOrders
  ) {}

  async create(payload: CreateShareInput): Promise<Share> {
    return this.createShare.execute(payload);
  }

  async getAll(): Promise<Share[]> {
    return this.getAllShares.execute();
  }

  async getById(payload: GetShareInput): Promise<Share> {
    return this.getShareById.execute(payload);
  }

  async order(payload: PlaceOrderInput): Promise<Order> {
    return this.placeOrder.execute(payload);
  }

  async cancel(payload: CancelOrderInput): Promise<void> {
    return this.cancelOrder.execute(payload);
  }

  async getPositions(
    payload: GetPositionsInput
  ): Promise<SecuritiesPosition[]> {
    return this.getClientPositions.execute(payload);
  }

  async getOrders(customerId: string): Promise<Order[]> {
    return this.getOrdersByCustomer.execute(customerId);
  }

  async getTransactionHistory(
    payload: GetShareTransactionHistoryInput
  ): Promise<ShareTransaction[]> {
    return this.getShareTransactionHistory.execute(payload);
  }

  async getOrderBook(payload: GetOrderBookInput): Promise<OrderBookResult> {
    return this.getOrderBookUseCase.execute(payload);
  }

  async calculatePrice(
    payload: CalculateSharePriceInput
  ): Promise<SharePriceCalculation> {
    return this.calculateSharePrice.execute(payload);
  }

  async executeMatching(
    payload: ExecuteMatchingOrdersInput
  ): Promise<ExecutionResult> {
    return this.executeMatchingOrders.execute(payload);
  }
}
