import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";

export interface Share {
  id: string;
  name: string;
  totalNumberOfParts: number;
  initialPrice: number;
  lastExecutedPrice: number | null;
}

export interface ShareWithPrice extends Share {
  currentPrice: number;
}

export interface CreateShareRequest {
  name: string;
  totalNumberOfParts: number;
  initialPrice: number;
}

export interface UpdateShareRequest {
  name?: string;
  totalNumberOfParts?: number;
}

function parseShare(data: any): Share {
  return {
    id: data.id,
    name: data.name,
    totalNumberOfParts: Number(data.totalNumberOfParts),
    initialPrice: Number(data.initialPrice),
    lastExecutedPrice: data.lastExecutedPrice ? Number(data.lastExecutedPrice) : null,
  };
}

export const sharesApi = {
  async getAll(): Promise<Share[]> {
    const response = await request("/shares");
    if (!isJsonObject(response) || !Array.isArray(response.shares)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid shares response");
    }
    return response.shares.map(parseShare);
  },

  async getById(shareId: string): Promise<ShareWithPrice> {
    const response = await request(`/shares/${shareId}`);
    if (!isJsonObject(response) || !isJsonObject(response.share)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid share response");
    }
    const share = parseShare(response.share);
    return {
      ...share,
      currentPrice: share.lastExecutedPrice ?? share.initialPrice,
    };
  },

  async create(data: CreateShareRequest): Promise<{ id: string }> {
    const response = await request("/shares", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid create share response"
      );
    }
    // La réponse contient {id, share}
    return { id: (response as any).id || (response as any).share?.id };
  },

  async update(shareId: string, data: UpdateShareRequest): Promise<Share> {
    const response = await request(`/shares/${shareId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.share)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid update share response"
      );
    }
    return parseShare(response.share);
  },

  async delete(shareId: string): Promise<void> {
    await request(`/shares/${shareId}`, {
      method: "DELETE",
    });
  },

  async getOrderBook(shareId: string): Promise<{
    bids: Array<{ price: number; quantity: number }>;
    asks: Array<{ price: number; quantity: number }>;
  }> {
    const response = await request(`/shares/${shareId}/order-book`);
    if (!isJsonObject(response)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid order book response");
    }
    return {
      bids: (response.bids || response.buyOrders || []).map((bid: any) => ({
        price: Number(bid.price),
        quantity: Number(bid.quantity),
      })),
      asks: (response.asks || response.sellOrders || []).map((ask: any) => ({
        price: Number(ask.price),
        quantity: Number(ask.quantity),
      })),
    };
  },
};
