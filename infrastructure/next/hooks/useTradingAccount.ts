"use client";

import { useAccounts } from "./useAccounts";

export function useTradingAccount() {
  const { accounts, isLoading, error } = useAccounts();
  
  const tradingAccount = accounts.find(
    (account) => account.accountType === "trading"
  );
  
  const hasTradingAccount = !!tradingAccount;
  
  return {
    tradingAccount,
    hasTradingAccount,
    isLoading,
    error,
  };
}
