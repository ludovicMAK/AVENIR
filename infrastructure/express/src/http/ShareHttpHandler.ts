import { Request, Response } from "express";
import { ShareController } from "@express/controllers/ShareController";
import {
  CreateShareInput,
  UpdateShareInput,
  DeleteShareInput,
  PlaceOrderInput,
  CancelOrderInput,
  GetPositionsInput,
  GetShareInput,
  GetShareTransactionHistoryInput,
  GetOrderBookInput,
  CalculateSharePriceInput,
  ExecuteMatchingOrdersInput,
} from "@application/requests/shares";
import { mapErrorToHttpResponse } from "@express/src/responses/error";
import { sendSuccess } from "@express/src/responses/success";
import {
  ShareResponseData,
  ShareUpdateResponseData,
  ShareDeleteResponseData,
  OrderResponseData,
} from "@express/types/responses";

export class ShareHttpHandler {
  constructor(private readonly controller: ShareController) {}

  async create(request: Request, response: Response) {
    try {
      const payload: CreateShareInput = request.body;
      const share = await this.controller.create(payload);
      const responseData: ShareResponseData = {
        id: share.id,
        share: {
          id: share.id,
          name: share.name,
          totalNumberOfParts: share.totalNumberOfParts,
          initialPrice: share.initialPrice,
          lastExecutedPrice: share.lastExecutedPrice,
        },
      };
      return sendSuccess(response, {
        status: 201,
        code: "SHARE_CREATED",
        message: "Share created successfully.",
        data: responseData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getAll(request: Request, response: Response) {
    try {
      const shares = await this.controller.getAll();
      const serializedShares = shares.map((share) => ({
        id: share.id,
        name: share.name,
        totalNumberOfParts: share.totalNumberOfParts,
        initialPrice: share.initialPrice,
        lastExecutedPrice: share.lastExecutedPrice,
      }));
      response.status(200).json({ shares: serializedShares });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getById(request: Request, response: Response) {
    try {
      const payload: GetShareInput = { shareId: request.params.id };
      const share = await this.controller.getById(payload);
      const serializedShare = {
        id: share.id,
        name: share.name,
        totalNumberOfParts: share.totalNumberOfParts,
        initialPrice: share.initialPrice,
        lastExecutedPrice: share.lastExecutedPrice,
      };
      response.status(200).json({ share: serializedShare });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async update(request: Request, response: Response) {
    try {
      const payload: UpdateShareInput = {
        shareId: request.params.id,
        ...request.body,
      };
      const share = await this.controller.update(payload);
      const responseData: ShareUpdateResponseData = {
        share: {
          id: share.id,
          name: share.name,
          totalNumberOfParts: share.totalNumberOfParts,
          initialPrice: share.initialPrice,
          lastExecutedPrice: share.lastExecutedPrice,
        },
      };
      return sendSuccess(response, {
        status: 200,
        code: "SHARE_UPDATED",
        message: "Share updated successfully.",
        data: responseData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const payload: DeleteShareInput = { shareId: request.params.id };
      await this.controller.delete(payload);
      const responseData: ShareDeleteResponseData = {};
      return sendSuccess(response, {
        status: 200,
        code: "SHARE_DELETED",
        message: "Share deleted successfully.",
        data: responseData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async placeOrder(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      const payload: PlaceOrderInput = {
        ...request.body,
        customerId: userId,
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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      const payload: GetPositionsInput = {
        customerId: userId,
      };
      
      // Récupérer les positions du client
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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      const customerId = request.params.customerId;
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
      const shareId = request.params.id;
      const transactions = await this.controller.executeMatchingOrders(shareId);
      response.status(200).json(transactions);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async calculatePrice(request: Request, response: Response) {
    try {
      const shareId = request.params.id;
      const priceCalculation = await this.controller.calculatePrice(shareId);
      response.status(200).json(priceCalculation);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getOrderBook(request: Request, response: Response) {
    try {
      const shareId = request.params.id;
      const orderBook = await this.controller.getOrderBook(shareId);
      response.status(200).json(orderBook);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getTransactionHistory(request: Request, response: Response) {
    try {
      const shareId = request.params.id;
      const transactions = await this.controller.getTransactionHistory(shareId);
      response.status(200).json(transactions);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getMyOrders(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      const orders = await this.controller.getOrders(userId);
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

  async getMyPositions(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      const payload: GetPositionsInput = { customerId: userId };
      
      // Récupérer les positions du client
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
}
