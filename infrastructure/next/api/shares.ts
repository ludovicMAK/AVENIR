import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";

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

function parseShare(data: JsonObject): Share {
  const hasValue = (value: JsonValue | undefined): boolean =>
    value !== undefined && value !== null;

  const id = data.id;
  const name = data.name;
  const totalNumberOfParts = Number(data.totalNumberOfParts);
  const initialPrice = Number(data.initialPrice);
  const lastExecutedRaw = data.lastExecutedPrice;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    Number.isNaN(totalNumberOfParts) ||
    Number.isNaN(initialPrice)
  ) {
    throw new ApiError("INFRASTRUCTURE_ERROR", "Malformed share payload");
  }

  return {
    id,
    name,
    totalNumberOfParts,
    initialPrice,
    lastExecutedPrice: hasValue(lastExecutedRaw) ? Number(lastExecutedRaw) : null,
  };
}

export const sharesApi = {
  async getAll(): Promise<Share[]> {
    const response = await request("/shares");
    if (!isJsonObject(response) || !Array.isArray(response.shares)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid shares response");
    }
    const shares = response.shares.filter(isJsonObject);
    if (shares.length !== response.shares.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid shares response");
    }
    return shares.map(parseShare);
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
    const id =
      typeof response.id === "string"
        ? response.id
        : isJsonObject(response.share) && typeof response.share.id === "string"
        ? response.share.id
        : null;
    if (!id) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid create share response"
      );
    }
    return { id };
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

    const bidsRaw = Array.isArray(response.bids)
      ? response.bids
      : Array.isArray(response.buyOrders)
      ? response.buyOrders
      : [];
    const asksRaw = Array.isArray(response.asks)
      ? response.asks
      : Array.isArray(response.sellOrders)
      ? response.sellOrders
      : [];

    const bids = bidsRaw.filter(isJsonObject);
    const asks = asksRaw.filter(isJsonObject);

    if (bids.length !== bidsRaw.length || asks.length !== asksRaw.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid order book response");
    }

    return {
      bids: bids.map((bid) => ({
        price: Number(bid.price),
        quantity: Number(bid.quantity),
      })),
      asks: asks.map((ask) => ({
        price: Number(ask.price),
        quantity: Number(ask.quantity),
      })),
    };
  },
};
