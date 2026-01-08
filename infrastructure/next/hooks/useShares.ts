"use client";

import { useState, useCallback, useEffect } from "react";
import { sharesApi, Share, ShareWithPrice } from "@/api/shares";
import { ApiError } from "@/lib/errors";

export function useShares() {
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchShares = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sharesApi.getAll();
      setShares(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  return {
    shares,
    isLoading,
    error,
    refresh: fetchShares,
  };
}

export function useShare(shareId: string) {
  const [share, setShare] = useState<ShareWithPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchShare = useCallback(async () => {
    if (!shareId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sharesApi.getById(shareId);
      setShare(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchShare();
  }, [fetchShare]);

  return {
    share,
    isLoading,
    error,
    refresh: fetchShare,
  };
}

export function useOrderBook(shareId: string) {
  const [orderBook, setOrderBook] = useState<{
    bids: Array<{ price: number; quantity: number }>;
    asks: Array<{ price: number; quantity: number }>;
  }>({ bids: [], asks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchOrderBook = useCallback(async () => {
    if (!shareId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sharesApi.getOrderBook(shareId);
      setOrderBook(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchOrderBook();
  }, [fetchOrderBook]);

  return {
    orderBook,
    isLoading,
    error,
    refresh: fetchOrderBook,
  };
}
