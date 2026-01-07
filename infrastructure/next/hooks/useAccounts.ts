"use client";

import { useState, useCallback } from "react";
import { accountsApi } from "@/api/account";
import { Account, AccountTypeValue } from "@/types/accounts";
import { ApiError } from "@/lib/errors";

type UseAccountsState = {
  accounts: Account[];
  isLoading: boolean;
  error: ApiError | null;
};

type UseAccountDetailsState = {
  account: Account | null;
  isLoading: boolean;
  error: ApiError | null;
};

type UseAccountBalanceState = {
  balance: {
    accountId: string;
    balance: number;
    balanceAvailable: number;
    totalDebits: number;
    totalCredits: number;
    pendingTransactions: number;
  } | null;
  isLoading: boolean;
  error: ApiError | null;
};

type UseAccountTransactionsState = {
  transactions: Array<{
    id: string;
    accountIBAN: string;
    transactionDirection: string;
    amount: number;
    reason: string;
    accountDate: string;
    status: string;
    transferId?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: ApiError | null;
};

type UseAccountStatementState = {
  statement: {
    accountId: string;
    accountName: string;
    IBAN: string;
    period: {
      startDate: string;
      endDate: string;
    };
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    totalCredits: number;
    transactions: Array<{
      id: string;
      date: string;
      description: string;
      direction: string;
      amount: number;
      balance: number;
    }>;
  } | null;
  isLoading: boolean;
  error: ApiError | null;
};

/**
 * Hook pour récupérer les comptes d'un propriétaire
 */
export function useAccountsByOwner(ownerId?: string) {
  const [state, setState] = useState<UseAccountsState>({
    accounts: [],
    isLoading: false,
    error: null,
  });

  const fetchAccounts = useCallback(async () => {
    if (!ownerId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const accounts = await accountsApi.getByOwnerId(ownerId);
      setState({ accounts, isLoading: false, error: null });
    } catch (error) {
      setState({
        accounts: [],
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      });
    }
  }, [ownerId]);

  const refresh = useCallback(() => {
    return fetchAccounts();
  }, [fetchAccounts]);

  return { ...state, refresh, fetchAccounts };
}

/**
 * Hook pour récupérer les détails d'un compte
 */
export function useAccountDetails(accountId?: string) {
  const [state, setState] = useState<UseAccountDetailsState>({
    account: null,
    isLoading: false,
    error: null,
  });

  const fetchAccount = useCallback(async () => {
    if (!accountId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const account = await accountsApi.getById(accountId);
      setState({ account, isLoading: false, error: null });
    } catch (error) {
      setState({
        account: null,
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      });
    }
  }, [accountId]);

  const refresh = useCallback(() => {
    return fetchAccount();
  }, [fetchAccount]);

  return { ...state, refresh, fetchAccount };
}

/**
 * Hook pour créer un compte
 */
export function useCreateAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createAccount = useCallback(
    async (data: {
      idOwner: string;
      accountType: AccountTypeValue;
      accountName: string;
      authorizedOverdraft?: boolean;
      overdraftLimit?: number;
      overdraftFees?: number;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const account = await accountsApi.create(data);
        setIsLoading(false);
        return account;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred");
        setError(apiError);
        setIsLoading(false);
        throw apiError;
      }
    },
    []
  );

  return { createAccount, isLoading, error };
}

/**
 * Hook pour renommer un compte
 */
export function useUpdateAccountName() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateName = useCallback(
    async (accountId: string, accountName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const account = await accountsApi.updateName(accountId, accountName);
        setIsLoading(false);
        return account;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred");
        setError(apiError);
        setIsLoading(false);
        throw apiError;
      }
    },
    []
  );

  return { updateName, isLoading, error };
}

/**
 * Hook pour clôturer un compte
 */
export function useCloseAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const closeAccount = useCallback(async (accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await accountsApi.close(accountId);
      setIsLoading(false);
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred");
      setError(apiError);
      setIsLoading(false);
      throw apiError;
    }
  }, []);

  return { closeAccount, isLoading, error };
}

/**
 * Hook pour récupérer le solde d'un compte
 */
export function useAccountBalance(accountId?: string) {
  const [state, setState] = useState<UseAccountBalanceState>({
    balance: null,
    isLoading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!accountId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const balance = await accountsApi.getBalance(accountId);
      setState({ balance, isLoading: false, error: null });
    } catch (error) {
      setState({
        balance: null,
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      });
    }
  }, [accountId]);

  const refresh = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  return { ...state, refresh, fetchBalance };
}

/**
 * Hook pour récupérer les transactions d'un compte
 */
export function useAccountTransactions(
  accountId?: string,
  params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    direction?: "debit" | "credit";
    minAmount?: number;
    maxAmount?: number;
  }
) {
  const [state, setState] = useState<UseAccountTransactionsState>({
    transactions: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchTransactions = useCallback(async () => {
    if (!accountId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await accountsApi.getTransactions(accountId, params);
      setState({
        transactions: data.transactions,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        transactions: [],
        pagination: null,
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      });
    }
  }, [accountId, params]);

  const refresh = useCallback(() => {
    return fetchTransactions();
  }, [fetchTransactions]);

  return { ...state, refresh, fetchTransactions };
}

/**
 * Hook pour récupérer le relevé de compte
 */
export function useAccountStatement(
  accountId?: string,
  params?: {
    startDate: string;
    endDate: string;
  }
) {
  const [state, setState] = useState<UseAccountStatementState>({
    statement: null,
    isLoading: false,
    error: null,
  });

  const fetchStatement = useCallback(async () => {
    if (!accountId || !params?.startDate || !params?.endDate) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const statement = await accountsApi.getStatement(accountId, params);
      setState({ statement, isLoading: false, error: null });
    } catch (error) {
      setState({
        statement: null,
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      });
    }
  }, [accountId, params]);

  const refresh = useCallback(() => {
    return fetchStatement();
  }, [fetchStatement]);

  return { ...state, refresh, fetchStatement };
}
