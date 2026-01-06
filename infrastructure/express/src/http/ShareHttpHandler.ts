import { Request, Response } from "express";
import { ShareController } from "@express/controllers/ShareController";
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
import { mapErrorToHttpResponse } from "@express/src/responses/error";

export class ShareHttpHandler {
  constructor(private readonly controller: ShareController) {}

  async create(request: Request, response: Response) {
    try {
      const payload: CreateShareInput = request.body;
      const share = await this.controller.create(payload);
      response.status(201).json(share);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getAll(request: Request, response: Response) {
    try {
      const shares = await this.controller.getAll();
      response.status(200).json(shares);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getById(request: Request, response: Response) {
    try {
      const payload: GetShareInput = { shareId: request.params.id };
      const share = await this.controller.getById(payload);
      response.status(200).json(share);
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

      const payload: PlaceOrderInput = request.body;
      const order = await this.controller.order(payload);
      response.status(201).json(order);
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
        customerId: request.params.customerId,
      };
      const positions = await this.controller.getPositions(payload);
      response.status(200).json(positions);
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
      response.status(200).json(orders);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getTransactionHistory(request: Request, response: Response) {
    try {
      const payload: GetShareTransactionHistoryInput = {
        shareId: request.params.shareId,
      };
      const transactions = await this.controller.getTransactionHistory(payload);
      response.status(200).json(transactions);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async getOrderBook(request: Request, response: Response) {
    try {
      const payload: GetOrderBookInput = {
        shareId: request.params.shareId,
      };
      const orderBook = await this.controller.getOrderBook(payload);
      response.status(200).json(orderBook);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async calculatePrice(request: Request, response: Response) {
    try {
      const payload: CalculateSharePriceInput = {
        shareId: request.params.shareId,
      };
      const priceCalculation = await this.controller.calculatePrice(payload);
      response.status(200).json(priceCalculation);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async executeMatching(request: Request, response: Response) {
    try {
      const payload: ExecuteMatchingOrdersInput = {
        shareId: request.params.shareId,
      };
      const result = await this.controller.executeMatching(payload);
      response.status(200).json(result);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
