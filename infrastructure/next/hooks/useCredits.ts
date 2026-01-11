"use client";

import { useState, useCallback, useEffect } from "react";
import {
  creditsApi,
  CreditWithDueDates,
  Credit,
  DueDate,
  AmortizationScheduleEntry,
  SimulateScheduleRequest,
  PayInstallmentRequest,
  EarlyRepaymentRequest,
} from "@/api/credits";
import { ApiError } from "@/lib/errors";
import { useCurrentUser } from "./useCurrentUser";

export function useCredits() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [credits, setCredits] = useState<CreditWithDueDates[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchCredits = useCallback(async () => {
    // Ne pas faire de requête si l'utilisateur n'est pas encore chargé
    if (isUserLoading) return;
    
    // Ne pas faire de requête si l'utilisateur n'existe pas ou n'a pas d'ID valide
    if (!user?.id) {
      setError(new Error("Utilisateur non connecté"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await creditsApi.getMyCredits();
      setCredits(result);
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
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchCredits,
  };
}

export function useCreditStatus(creditId: string) {
  const [credit, setCredit] = useState<Credit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchCreditStatus = useCallback(async () => {
    if (!creditId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await creditsApi.getCreditStatus(creditId);
      setCredit(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [creditId]);

  useEffect(() => {
    fetchCreditStatus();
  }, [fetchCreditStatus]);

  return {
    credit,
    isLoading,
    error,
    refresh: fetchCreditStatus,
  };
}

export function usePaymentHistory(creditId: string) {
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchPaymentHistory = useCallback(async () => {
    if (!creditId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await creditsApi.getPaymentHistory(creditId);
      setDueDates(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [creditId]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    dueDates,
    isLoading,
    error,
    refresh: fetchPaymentHistory,
  };
}

export function useSimulateSchedule() {
  const [schedule, setSchedule] = useState<AmortizationScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const simulate = useCallback(async (data: SimulateScheduleRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await creditsApi.simulateSchedule(data);
      setSchedule(result);
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
    schedule,
    simulate,
    isLoading,
    error,
  };
}

export function usePayInstallment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const payInstallment = useCallback(async (data: PayInstallmentRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await creditsApi.payInstallment(data);
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
    payInstallment,
    isLoading,
    error,
  };
}

export function useEarlyRepayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const earlyRepayment = useCallback(async (data: EarlyRepaymentRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await creditsApi.earlyRepayment(data);
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
    earlyRepayment,
    isLoading,
    error,
  };
}
