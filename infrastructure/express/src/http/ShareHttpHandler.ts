import { Request, Response } from "express";
import { ShareController } from "@express/controllers/ShareController";
import {
  CreateShareInput,
  PlaceOrderInput,
  CancelOrderInput,
  GetPositionsInput,
  GetShareInput,
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
      const payload: PlaceOrderInput = request.body;
      const order = await this.controller.order(payload);
      response.status(201).json(order);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async cancelOrder(request: Request, response: Response) {
    try {
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
      const customerId = request.params.customerId;
      const orders = await this.controller.getOrders(customerId);
      response.status(200).json(orders);
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
