import { Request, Response } from "express";
import { ShareController } from "@express/controllers/ShareController";
import {
  CreateShareInput,
  PlaceOrderInput,
  CancelOrderInput,
  GetPositionsInput,
  GetShareInput,
  UpdateShareInput,
  DeleteShareInput,
  ToggleShareActivationInput,
} from "@application/requests/shares";
import { mapErrorToHttpResponse } from "@express/src/responses/error";
import { sendSuccess } from "@express/src/responses/success";
import { ValidationError, UnauthorizedError } from "@application/errors";
import { ShareView } from "@express/types/responses";
import { Share } from "@domain/entities/share";
import { AuthGuard } from "@express/src/http/AuthGuard";

interface OrderResponseData {
  orderId: string;
}

export class ShareHttpHandler {
  constructor(
    private readonly controller: ShareController,
    private readonly authGuard: AuthGuard
  ) {}

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization as string;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    return token ?? null;
  }

  private async getAuthContext(request: Request) {
    const user = await this.authGuard.requireAuthenticated(request);
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedError("Authentication required.");
    }
    return { user, token };
  }

  private parseNumber(value: unknown, fieldName: string): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ValidationError(`${fieldName} must be a number`);
    }
    return value;
  }

  private parseOptionalNumber(
    value: unknown,
    fieldName: string
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this.parseNumber(value, fieldName);
  }

  private parseOptionalString(
    value: unknown,
    fieldName: string
  ): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new ValidationError(`${fieldName} must be a string`);
    }
    return value;
  }

  private toShareView(share: Share): ShareView {
    return {
      id: share.id,
      name: share.name,
      totalNumberOfParts: share.totalNumberOfParts,
      initialPrice: share.initialPrice,
      lastExecutedPrice: share.lastExecutedPrice,
      isActive: share.isActive,
    };
  }

  async create(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);
      const name = request.body?.name;
      if (typeof name !== "string") {
        throw new ValidationError("Share name must be a string");
      }

      const totalNumberOfParts = this.parseNumber(
        request.body?.totalNumberOfParts,
        "Total number of parts"
      );
      const initialPrice = this.parseNumber(
        request.body?.initialPrice,
        "Initial price"
      );

      const payload: CreateShareInput = {
        name,
        totalNumberOfParts,
        initialPrice,
      };
      const share = await this.controller.create(payload);
      response.status(201).json(this.toShareView(share));
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getAll(request: Request, response: Response) {
    try {
      const shares = await this.controller.getAll();
      response.status(200).json({
        shares: shares.map((share) => this.toShareView(share)),
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getById(request: Request, response: Response) {
    try {
      const payload: GetShareInput = { shareId: request.params.shareId };
      const share = await this.controller.getById(payload);
      response.status(200).json({ share: this.toShareView(share) });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async placeOrder(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const payload: PlaceOrderInput = {
        ...request.body,
        customerId: user.id,
        token,
      };
      const order = await this.controller.order(payload);
      const responseData: OrderResponseData = { orderId: order.id };
      return sendSuccess(response, {
        status: 201,
        code: "ORDER_PLACED",
        message: "Order placed successfully.",
        data: responseData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async cancelOrder(request: Request, response: Response) {
    try {
      await this.getAuthContext(request);

      const payload: CancelOrderInput = {
        orderId: request.params.orderId,
        customerId: request.body.customerId,
      };
      await this.controller.cancel(payload);
      response.status(204).send();
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getPositions(request: Request, response: Response) {
    try {
      const { user } = await this.getAuthContext(request);

      const payload: GetPositionsInput = {
        customerId: user.id,
      };
      
      const positions = await this.controller.getPositions(payload);
      
      const enrichedPositions = await Promise.all(
        positions.map(async (position) => {
          try {
            const share = await this.controller.getById({ shareId: position.shareId });
            if (!share) {
              return null;
            }
            
            const quantity = Number(position.totalQuantity || 0) - Number(position.blockedQuantity || 0);
            
            let currentPrice = 0;
            if (share.lastExecutedPrice !== null && share.lastExecutedPrice !== undefined) {
              currentPrice = Number(share.lastExecutedPrice);
            } else if (share.initialPrice !== null && share.initialPrice !== undefined) {
              currentPrice = Number(share.initialPrice);
            }
            
            const averagePrice = currentPrice;
            
            const totalValue = quantity * currentPrice;
            const invested = quantity * averagePrice;
            const gainLoss = totalValue - invested;
            const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0;
            
            return {
              shareId: share.id || '',
              shareName: share.name || 'Unknown',
              quantity: quantity,
              averagePrice: averagePrice,
              currentPrice: currentPrice,
              totalValue: totalValue,
              gainLoss: gainLoss,
              gainLossPercentage: gainLossPercentage,
            };
          } catch (error) {
            return null;
          }
        })
      );
      
      const filteredPositions = enrichedPositions.filter((p) => p !== null && p.quantity > 0);
      
      response.status(200).json({ positions: filteredPositions });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getOrders(request: Request, response: Response) {
    try {
      const { user } = await this.getAuthContext(request);
      const customerId = request.params.customerId ?? user.id;
      const orders = await this.controller.getOrders(customerId);
      const serializedOrders = orders.map((order) => ({
        id: order.id,
        customerId: order.customerId,
        shareId: order.shareId,
        direction: order.direction,
        quantity: order.quantity,
        priceLimit: order.priceLimit,
        validity: order.validity,
        status: order.status,
        dateCaptured: order.dateCaptured,
        blockedAmount: order.blockedAmount,
      }));
      response.status(200).json({ orders: serializedOrders });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async executeMatchingOrders(request: Request, response: Response) {
    try {
      const shareId = request.params.shareId;
      const transactions = await this.controller.executeMatchingOrders(shareId);
      response.status(200).json(transactions);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async calculatePrice(request: Request, response: Response) {
    try {
      const shareId = request.params.shareId;
      const priceCalculation = await this.controller.calculatePrice(shareId);
      response.status(200).json(priceCalculation);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getOrderBook(request: Request, response: Response) {
    try {
      const shareId = request.params.shareId;
      const orderBook = await this.controller.getOrderBook(shareId);
      response.status(200).json(orderBook);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getTransactionHistory(request: Request, response: Response) {
    try {
      const shareId = request.params.shareId;
      const transactions = await this.controller.getTransactionHistory(shareId);
      response.status(200).json(transactions);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async update(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const shareId = request.params.shareId;
      if (!shareId) {
        throw new ValidationError("Share id is required.");
      }

      const name = this.parseOptionalString(request.body?.name, "Share name");
      const totalNumberOfParts = this.parseOptionalNumber(
        request.body?.totalNumberOfParts,
        "Total number of parts"
      );
      const initialPrice = this.parseOptionalNumber(
        request.body?.initialPrice,
        "Initial price"
      );

      const payload: UpdateShareInput = {
        shareId,
        name,
        totalNumberOfParts,
        initialPrice,
      };
      const updatedShare = await this.controller.update(payload);
      response.status(200).json(this.toShareView(updatedShare));
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async delete(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const shareId = request.params.shareId;
      if (!shareId) {
        throw new ValidationError("Share id is required.");
      }

      const payload: DeleteShareInput = { shareId };
      await this.controller.delete(payload);
      return sendSuccess(response, {
        status: 200,
        code: "SHARE_DELETED",
        message: "Share removed successfully.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async activate(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const shareId = request.params.shareId;
      if (!shareId) {
        throw new ValidationError("Share id is required.");
      }
      const payload: ToggleShareActivationInput = { shareId };
      const share = await this.controller.activate(payload);
      response.status(200).json(this.toShareView(share));
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async deactivate(request: Request, response: Response) {
    try {
      await this.authGuard.requireManager(request);

      const shareId = request.params.shareId;
      if (!shareId) {
        throw new ValidationError("Share id is required.");
      }
      const payload: ToggleShareActivationInput = { shareId };
      const share = await this.controller.deactivate(payload);
      response.status(200).json(this.toShareView(share));
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
