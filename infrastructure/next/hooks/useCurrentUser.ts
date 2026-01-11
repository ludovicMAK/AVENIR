"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/api/users";
import { UserSummary } from "@/types/users";
import { getAuthenticationToken } from "@/lib/auth/client";
import { setCurrentUserId } from "@/api/client";

export function useCurrentUser() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = getAuthenticationToken();
        if (!token) {
          console.log('[useCurrentUser] No token, clearing user');
          setUser(null);
          setCurrentUserId(null);
          setIsLoading(false);
          return;
        }

        console.log('[useCurrentUser] Loading user...');
        const userData = await usersApi.me(token);
        console.log('[useCurrentUser] User loaded:', userData);
        setUser(userData);
        setCurrentUserId(userData.id);
      } catch (err) {
        console.error('[useCurrentUser] Error loading user:', err);
        setError(err instanceof Error ? err : new Error("Failed to load user"));
        setUser(null);
        setCurrentUserId(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, isLoading, error };
}
