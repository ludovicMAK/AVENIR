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
import {
  CreateShareInput,
  PlaceOrderInput,
  CancelOrderInput,
  GetPositionsInput,
  GetShareInput,
} from "@application/requests/shares";
import { Share } from "@domain/entities/share";
import { Order } from "@domain/entities/order";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { ShareTransaction } from "@domain/entities/shareTransaction";

export class ShareController {
  constructor(
    private readonly createShare: CreateShare,
    private readonly getAllShares: GetAllShares,
    private readonly getShareById: GetShareById,
    private readonly placeOrder: PlaceOrder,
    private readonly cancelOrder: CancelOrder,
    private readonly getClientPositions: GetClientPositions,
    private readonly getOrdersByCustomer: GetOrdersByCustomer,
    private readonly executeMatchingOrdersUseCase: ExecuteMatchingOrders,
    private readonly calculateSharePriceUseCase: CalculateSharePrice,
    private readonly getOrderBookUseCase: GetOrderBook,
    private readonly getShareTransactionHistoryUseCase: GetShareTransactionHistory
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

  async executeMatchingOrders(shareId: string): Promise<ShareTransaction[]> {
    return this.executeMatchingOrdersUseCase.execute(shareId);
  }

  async calculatePrice(shareId: string): Promise<any> {
    return this.calculateSharePriceUseCase.execute(shareId);
  }

  async getOrderBook(shareId: string): Promise<any> {
    return this.getOrderBookUseCase.execute(shareId);
  }

  async getTransactionHistory(shareId: string): Promise<ShareTransaction[]> {
    return this.getShareTransactionHistoryUseCase.execute(shareId);
  }
}
