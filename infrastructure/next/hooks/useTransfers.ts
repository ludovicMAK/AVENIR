"use client";

import { useState, useCallback, useEffect } from "react";
import { transfersApi, CreateTransferRequest, Transfer } from "@/api/transfers";
import { ApiError } from "@/lib/errors";
import { useUser } from "@/lib/auth/UserContext";

export function useTransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const { user, isLoading: isUserLoading } = useUser();

  const fetchHistory = useCallback(async () => {
    if (!user || isUserLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await transfersApi.getHistory();
      setTransfers(result.transactions);
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
    fetchHistory();
  }, [fetchHistory]);

  return {
    transfers,
    isLoading,
    error,
    refresh: fetchHistory,
  };
}

export function useCreateTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const createTransfer = useCallback(async (data: CreateTransferRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await transfersApi.create(data);
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
    createTransfer,
    isLoading,
    error,
  };
}

export function useValidateTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const validateTransfer = useCallback(async (transferId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await transfersApi.validate(transferId);
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
    validateTransfer,
    isLoading,
    error,
  };
}

export function useCancelTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const cancelTransfer = useCallback(async (transferId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await transfersApi.cancel(transferId);
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
    cancelTransfer,
    isLoading,
    error,
  };
}
