import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject } from "@/types/json";

export interface Order {
  id: string;
  customerId: string;
  shareId: string;
  direction: "buy" | "sell";
  quantity: number;
  priceLimit: number;
  validity: string;
  status: string;
  dateCaptured: string;
  blockedAmount: number;
}

export interface PlaceOrderRequest {
  shareId: string;
  direction: "buy" | "sell";
  quantity: number;
  priceLimit: number;
  validity: "day" | "until_cancelled";
}

export interface Position {
  shareId: string;
  shareName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

function parseOrder(data: JsonObject): Order {
  return {
    id: String(data.id),
    customerId: String(data.customerId),
    shareId: String(data.shareId),
    direction: String(data.direction) as Order["direction"],
    quantity: Number(data.quantity),
    priceLimit: Number(data.priceLimit),
    validity: String(data.validity),
    status: String(data.status),
    dateCaptured: String(data.dateCaptured),
    blockedAmount: Number(data.blockedAmount),
  };
}

function parsePosition(data: JsonObject): Position {
  return {
    shareId: String(data.shareId),
    shareName: String(data.shareName),
    quantity: Number(data.quantity),
    averagePrice: Number(data.averagePrice),
    currentPrice: Number(data.currentPrice),
    totalValue: Number(data.totalValue),
    gainLoss: Number(data.gainLoss),
    gainLossPercentage: Number(data.gainLossPercentage),
  };
}

export const ordersApi = {
  async placeOrder(data: PlaceOrderRequest): Promise<{ orderId: string }> {
    const response = await request("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid place order response"
      );
    }
    return response as { orderId: string };
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await request("/my-orders");
    if (!isJsonObject(response) || !Array.isArray(response.orders)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid orders response");
    }
    const orders = response.orders.filter(isJsonObject);
    if (orders.length !== response.orders.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid orders response");
    }
    return orders.map(parseOrder);
  },

  async cancelOrder(orderId: string): Promise<void> {
    await request(`/orders/${orderId}`, {
      method: "DELETE",
    });
  },

  async getPositions(): Promise<Position[]> {
    const response = await request("/positions");
    if (!isJsonObject(response) || !Array.isArray(response.positions)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid positions response");
    }
    const positions = response.positions.filter(isJsonObject);
    if (positions.length !== response.positions.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid positions response");
    }
    return positions.map(parsePosition);
  },
};
