"use client";

import { useState, useCallback } from "react";
import { accountsApi } from "@/api/account";
import { ApiError } from "@/lib/errors";

export interface Transaction {
  id: string;
  accountIBAN: string;
  transactionDirection: string;
  amount: number;
  reason: string;
  accountDate: string;
  status: string;
  transferId?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  direction?: "debit" | "credit";
  minAmount?: number;
  maxAmount?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useAccountTransactions(accountId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchTransactions = useCallback(
    async (filters?: TransactionFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await accountsApi.getTransactions(accountId, filters);
        setTransactions(response.transactions);
        setPagination(response.pagination);
      } catch (err) {
        const error =
          err instanceof ApiError || err instanceof Error
            ? err
            : new Error("Une erreur inconnue est survenue");
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [accountId]
  );

  return {
    transactions,
    pagination,
    isLoading,
    error,
    fetchTransactions,
  };
}
