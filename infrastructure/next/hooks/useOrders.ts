"use client";

import { useState, useCallback, useEffect } from "react";
import { ordersApi, Order, PlaceOrderRequest, Position } from "@/api/orders";
import { ApiError } from "@/lib/errors";
import { useCurrentUser } from "./useCurrentUser";

export function useOrders() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchOrders = useCallback(async () => {
    if (isUserLoading) return;
    
    if (!user?.id) {
      setError(new Error("Utilisateur non connecté"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ordersApi.getMyOrders();
      setOrders(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchOrders,
  };
}

export function usePlaceOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const placeOrder = useCallback(async (data: PlaceOrderRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ordersApi.placeOrder(data);
      return result;
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    placeOrder,
    isLoading,
    error,
  };
}

export function useCancelOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const cancelOrder = useCallback(async (orderId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await ordersApi.cancelOrder(orderId);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancelOrder,
    isLoading,
    error,
  };
}

export function usePositions() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchPositions = useCallback(async () => {
    if (isUserLoading) return;
    
    if (!user?.id) {
      setError(new Error("Utilisateur non connecté"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ordersApi.getPositions();
      setPositions(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchPositions,
  };
}
