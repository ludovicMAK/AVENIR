import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";

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

function parseOrder(data: any): Order {
  return {
    id: data.id,
    customerId: data.customerId,
    shareId: data.shareId,
    direction: data.direction,
    quantity: Number(data.quantity),
    priceLimit: Number(data.priceLimit),
    validity: data.validity,
    status: data.status,
    dateCaptured: data.dateCaptured,
    blockedAmount: Number(data.blockedAmount),
  };
}

function parsePosition(data: any): Position {
  return {
    shareId: data.shareId || '',
    shareName: data.shareName || 'Unknown',
    quantity: Number(data.quantity || 0),
    averagePrice: Number(data.averagePrice || 0),
    currentPrice: Number(data.currentPrice || 0),
    totalValue: Number(data.totalValue || 0),
    gainLoss: Number(data.gainLoss || 0),
    gainLossPercentage: Number(data.gainLossPercentage || 0),
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
    return response.orders.map(parseOrder);
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
    return response.positions.map(parsePosition);
  },
};
