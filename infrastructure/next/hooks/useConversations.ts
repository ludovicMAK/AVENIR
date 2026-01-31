"use client";

import { useCallback, useEffect, useState } from "react";
import {
  conversationsApi,
  Conversation,
  ConversationParticipant,
  CreateConversationRequest,
  Message,
  SendMessageRequest,
} from "@/api/conversations";
import { ApiError } from "@/lib/errors";
import { useUser } from "@/lib/auth/UserContext";

export function useConversations() {
  const { user, isLoading: isUserLoading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchConversations = useCallback(async () => {
    if (isUserLoading) return;

    if (!user?.id) {
      setError(new ApiError("UNAUTHORIZED", "User not authenticated"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        user.role === "customer"
          ? await conversationsApi.getMyConversations()
          : await conversationsApi.getAdvisorConversations(user.id);
      setConversations(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchConversations,
  };
}

export function useMessages(conversationId: string) {
  const { user, isLoading: isUserLoading } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (isUserLoading) return;
    if (!user?.id) return;
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationsApi.getMessages(conversationId);
      setMessages(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isUserLoading, user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchMessages,
    setMessages,
  };
}

export function useConversationParticipants(conversationId: string) {
  const { user, isLoading: isUserLoading } = useUser();
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (isUserLoading) return;
    if (!user?.id) return;

    if (!conversationId) {
      setParticipants([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationsApi.getParticipants(conversationId);
      setParticipants(result);
    } catch (err) {
      const error =
        err instanceof ApiError || err instanceof Error
          ? err
          : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isUserLoading, user?.id]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return {
    participants,
    isLoading: isLoading || isUserLoading,
    error,
    refresh: fetchParticipants,
    setParticipants,
  };
}

export function useCreateConversation() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const createConversation = useCallback(
    async (data: Omit<CreateConversationRequest, "customerId">) => {
      if (isUserLoading) {
        throw new Error("User is still loading");
      }

      if (!user?.id) {
        throw new ApiError("UNAUTHORIZED", "User not authenticated");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await conversationsApi.createConversation({
          ...data,
          customerId: user.id,
        });
        return result;
      } catch (err) {
        const error =
          err instanceof ApiError || err instanceof Error
            ? err
            : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, isUserLoading]
  );

  return {
    createConversation,
    isLoading,
    error,
  };
}

export function useSendMessage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const sendMessage = useCallback(
    async (data: Omit<SendMessageRequest, "senderId">) => {
      if (isUserLoading) {
        throw new Error("User is still loading");
      }

      if (!user?.id) {
        throw new ApiError("UNAUTHORIZED", "User not authenticated");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await conversationsApi.sendMessage({
          ...data,
          senderId: user.id,
        });
        return result;
      } catch (err) {
        const error =
          err instanceof ApiError || err instanceof Error
            ? err
            : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, isUserLoading]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}

export function useCloseConversation() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const closeConversation = useCallback(
    async (conversationId: string) => {
      if (isUserLoading) {
        throw new Error("User is still loading");
      }

      if (!user?.id) {
        throw new ApiError("UNAUTHORIZED", "User not authenticated");
      }

      setIsLoading(true);
      setError(null);

      try {
        await conversationsApi.closeConversation(conversationId, user.id);
      } catch (err) {
        const error =
          err instanceof ApiError || err instanceof Error
            ? err
            : new ApiError("INFRASTRUCTURE_ERROR", "Unexpected error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, isUserLoading]
  );

  return {
    closeConversation,
    isLoading,
    error,
  };
}
