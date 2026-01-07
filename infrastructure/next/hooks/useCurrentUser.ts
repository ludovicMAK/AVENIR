"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/api/users";
import { UserSummary } from "@/types/users";
import { getAuthenticationToken } from "@/lib/auth/client";

export function useCurrentUser() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = getAuthenticationToken();
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const userData = await usersApi.me(token);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load user"));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, isLoading, error };
}
