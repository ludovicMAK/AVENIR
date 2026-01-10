"use client";

import { useState, useCallback, useEffect } from "react";
import {
  conversationsApi,
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from "@/api/conversations";
import { ApiError } from "@/lib/errors";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationsApi.getMyConversations();
      setConversations(result);
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
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh: fetchConversations,
  };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const fetchMessages = useCallback(async () => {
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
          : new Error("Une erreur inconnue est survenue");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    refresh: fetchMessages,
    setMessages,
  };
}

export function useCreateConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const createConversation = useCallback(
    async (data: CreateConversationRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await conversationsApi.createConversation(data);
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
    },
    []
  );

  return {
    createConversation,
    isLoading,
    error,
  };
}

export function useSendMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationsApi.sendMessage(data);
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
    sendMessage,
    isLoading,
    error,
  };
}

export function useCloseConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const closeConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await conversationsApi.closeConversation(conversationId);
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
    closeConversation,
    isLoading,
    error,
  };
}
