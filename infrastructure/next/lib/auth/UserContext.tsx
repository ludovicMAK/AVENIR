"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { UserSummary } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { setCurrentUserId } from "@/api/client";

interface UserContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    setCurrentUserId(user?.id || null);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
