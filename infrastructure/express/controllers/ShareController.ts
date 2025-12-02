import { CreateShare } from "@application/usecases/createShare";
import { GetAllShares } from "@application/usecases/getAllShares";
import { GetShareById } from "@application/usecases/getShareById";
import { PlaceOrder } from "@application/usecases/placeOrder";
import { CancelOrder } from "@application/usecases/cancelOrder";
import { GetClientPositions } from "@application/usecases/getClientPositions";
import { GetOrdersByCustomer } from "@application/usecases/getOrdersByCustomer";
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

export class ShareController {
  constructor(
    private readonly createShare: CreateShare,
    private readonly getAllShares: GetAllShares,
    private readonly getShareById: GetShareById,
    private readonly placeOrder: PlaceOrder,
    private readonly cancelOrder: CancelOrder,
    private readonly getClientPositions: GetClientPositions,
    private readonly getOrdersByCustomer: GetOrdersByCustomer
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
}
