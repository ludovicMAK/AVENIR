"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { ArrowLeft, MessageCircle, Send, X } from "lucide-react";

import { conversationsApi, Message } from "@/api/conversations";
import {
  useConversations,
  useConversationParticipants,
  useCloseConversation,
  useMessages,
  useSendMessage,
} from "@/hooks/useConversations";
import { getAuthenticationToken } from "@/lib/auth/client";
import { useUser } from "@/lib/auth/UserContext";
import { ApiError } from "@/lib/errors";
import { useI18n, useTranslations } from "@/lib/i18n/simple-i18n";
import { ChatSocket, connectSocket } from "@/lib/realtime/socket";
import {
  ConversationClosedEvent,
  ConversationCreatedEvent,
  ConversationTransferredEvent,
  RealtimeMessage,
  SocketErrorEvent,
} from "@/lib/realtime/types";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/atoms/AlertDialog";
import { Input } from "@/components/atoms/Input";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";

type SocketStatus = "disconnected" | "connecting" | "connected" | "error";
export type ChatBoxVariant = "floating" | "page";

export interface ChatBoxProps {
  variant?: ChatBoxVariant;
  conversationId?: string;
  className?: string;
  onBack?: () => void;
  onConversationClosed?: (conversationId: string) => void;
}

function toUiMessage(payload: RealtimeMessage): Message {
  const sentAt =
    typeof payload.sendDate === "string"
      ? payload.sendDate
      : payload.sendDate.toISOString();
  return {
    id: payload.id,
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    senderRole: payload.senderRole,
    content: payload.text,
    sentAt,
  };
}

export function ChatBox(props: ChatBoxProps) {
  const pathname = usePathname();
  const variant: ChatBoxVariant = props.variant ?? "floating";
  const shouldHideFloating =
    variant === "floating" &&
    pathname.startsWith("/dashboard/messages/") &&
    pathname !== "/dashboard/messages";

  if (shouldHideFloating) {
    return null;
  }

  return <ChatBoxInner {...props} />;
}

function ChatBoxInner({
  variant = "floating",
  conversationId,
  className,
  onBack,
  onConversationClosed,
}: ChatBoxProps) {
  const isFloating = variant === "floating";
  const { user, isLoading: isUserLoading } = useUser();
  const tMessages = useTranslations("messages");
  const tCommon = useTranslations("common");
  const { locale } = useI18n();
  const dateLocale = locale === "fr" ? fr : enUS;
  const { conversations, isLoading: isConversationsLoading, refresh } =
    useConversations();
  const openConversations = useMemo(
    () => conversations.filter((conversation) => conversation.status === "open"),
    [conversations]
  );
  const [selectedConversationId, setSelectedConversationId] = useState(
    conversationId ?? ""
  );

  const apiErrorI18nKeyByCode: Record<string, string> = {
    VALIDATION_ERROR: "errors.validation",
    UNAUTHORIZED: "errors.unauthorized",
    FORBIDDEN: "errors.forbidden",
    NOT_FOUND: "errors.notFound",
    CONFLICT: "errors.conflict",
    UNPROCESSABLE_ENTITY: "errors.unprocessable",
    APPLICATION_ERROR: "errors.generic",
    INFRASTRUCTURE_ERROR: "errors.infrastructure",
  };

  const resolveErrorMessage = (error: unknown, fallbackKey: string): string => {
    if (error instanceof ApiError) {
      return tMessages(apiErrorI18nKeyByCode[error.code] ?? "errors.generic");
    }
    return tMessages(fallbackKey);
  };

  const {
    participants,
    isLoading: isParticipantsLoading,
    refresh: refreshParticipants,
  } = useConversationParticipants(selectedConversationId);

  const { messages, isLoading: isMessagesLoading, setMessages } =
    useMessages(selectedConversationId);

  const { sendMessage: sendMessageHttp, isLoading: isSendingHttp } =
    useSendMessage();

  const { closeConversation, isLoading: isClosingConversation } =
    useCloseConversation();

  const [isOpen, setIsOpen] = useState(!isFloating);
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("disconnected");
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const refreshedConversationIdsRef = useRef<Set<string>>(new Set());
  const refreshedPendingSubjectIdsRef = useRef<Set<string>>(new Set());

  const [draft, setDraft] = useState("");
  const [unreadByConversationId, setUnreadByConversationId] = useState<
    Record<string, number>
  >({});

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = Object.values(unreadByConversationId).reduce(
    (sum, value) => sum + value,
    0
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const participantsById = useMemo(() => {
    const entries = participants.map((p) => [p.id, p] as const);
    return new Map(entries);
  }, [participants]);

  const otherParticipants = useMemo(() => {
    if (!user) return [];
    return participants.filter((p) => p.id !== user.id);
  }, [participants, user]);

  const canSendMessage = useMemo(() => {
    if (!user || !selectedConversation) return false;
    if (selectedConversation.status !== "open") return false;

    const type = selectedConversation.type ?? "PRIVATE";
    if (type === "GROUP") {
      return user.role === "bankAdvisor" || user.role === "bankManager";
    }

    return user.role === "customer" || user.role === "bankAdvisor";
  }, [user, selectedConversation]);

  const canCloseConversation = useMemo(() => {
    if (!user || !selectedConversation) return false;
    if (variant !== "page") return false;
    if (selectedConversation.status !== "open") return false;

    const type = selectedConversation.type ?? "PRIVATE";
    if (type === "GROUP") return false;

    return user.role === "customer" || user.role === "bankAdvisor";
  }, [user, selectedConversation, variant]);

  useEffect(() => {
    if (!conversationId) return;
    setSelectedConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setUnreadByConversationId((prev) => {
      if (!(selectedConversationId in prev)) return prev;
      const next = { ...prev };
      delete next[selectedConversationId];
      return next;
    });
  }, [selectedConversationId, setMessages]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (!isOpen) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (conversationId) return;
    if (selectedConversationId) return;
    if (conversations.length === 0) return;

    setSelectedConversationId(openConversations[0]?.id ?? "");
  }, [conversations, openConversations, selectedConversationId, conversationId]);

  useEffect(() => {
    if (!isFloating) return;
    if (conversationId) return;
    if (!selectedConversationId) return;

    const selected = conversations.find((c) => c.id === selectedConversationId);
    if (selected?.status === "open") return;

    setSelectedConversationId(openConversations[0]?.id ?? "");
  }, [
    isFloating,
    conversationId,
    conversations,
    openConversations,
    selectedConversationId,
  ]);

  useEffect(() => {
    joinedRoomsRef.current = new Set();
  }, [socket]);

  useEffect(() => {
    if (!user?.id) return;

    const token = getAuthenticationToken();
    if (!token) return;

    setSocketStatus("connecting");

    let nextSocket: ChatSocket;
    try {
      nextSocket = connectSocket({
        userId: user.id,
        token,
        transports: ["websocket"],
      });
    } catch (error) {
      console.error("Failed to connect Socket.IO client", error);
      setSocketStatus("error");
      return;
    }
    setSocket(nextSocket);

    const handleConnect = () => setSocketStatus("connected");
    const handleDisconnect = () => setSocketStatus("disconnected");
    const handleConnectError = () => setSocketStatus("error");

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on("connect_error", handleConnectError);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off("connect_error", handleConnectError);
      nextSocket.disconnect();
      setSocket(null);
      setSocketStatus("disconnected");
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socket || socketStatus !== "connected") return;
    if (!user) return;

    if (!isFloating) {
      if (!selectedConversationId) return;

      if (!joinedRoomsRef.current.has(selectedConversationId)) {
        socket.emit("conversation:join", selectedConversationId);
        joinedRoomsRef.current.add(selectedConversationId);
      }

      return;
    }

    for (const conversation of conversations) {
      if (conversation.status !== "open") continue;
      const type = conversation.type ?? "PRIVATE";
      if (user.role === "customer" && type === "GROUP") continue;
      if (joinedRoomsRef.current.has(conversation.id)) continue;

      socket.emit("conversation:join", conversation.id);
      joinedRoomsRef.current.add(conversation.id);
    }
  }, [socket, socketStatus, conversations, user, isFloating, selectedConversationId]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload: RealtimeMessage) => {
      const incoming = toUiMessage(payload);

      if (
        !conversations.some((c) => c.id === incoming.conversationId) &&
        !refreshedConversationIdsRef.current.has(incoming.conversationId)
      ) {
        refreshedConversationIdsRef.current.add(incoming.conversationId);
        refresh();
      }

      const relatedConversation = conversations.find(
        (c) => c.id === incoming.conversationId
      );
      if (
        relatedConversation &&
        (relatedConversation.type ?? "PRIVATE").toUpperCase() === "PRIVATE" &&
        relatedConversation.subject.toLowerCase().includes("en attente") &&
        incoming.senderRole === "bankAdvisor" &&
        !refreshedPendingSubjectIdsRef.current.has(incoming.conversationId)
      ) {
        refreshedPendingSubjectIdsRef.current.add(incoming.conversationId);
        refresh();
      }

      if (incoming.conversationId === selectedConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        if (!participantsById.has(incoming.senderId)) {
          refreshParticipants();
        }
        return;
      }

      setUnreadByConversationId((prev) => ({
        ...prev,
        [incoming.conversationId]:
          (prev[incoming.conversationId] ?? 0) + 1,
      }));
    };

    const onMessageError = (payload: SocketErrorEvent) => {
      console.error("Socket message error", payload);
      toast.error(tMessages("toasts.sendMessageFailed"));
    };

    const onConversationError = (payload: SocketErrorEvent) => {
      console.error("Socket conversation error", payload);
      toast.error(tMessages("toasts.conversationError"));
    };

    const onConversationCreated = (_payload: ConversationCreatedEvent) => {
      refresh();
    };

    const onConversationClosed = (_payload: ConversationClosedEvent) => {
      refresh();
    };

    const onConversationTransferred = (
      _payload: ConversationTransferredEvent
    ) => {
      refresh();
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:error", onMessageError);
    socket.on("conversation:error", onConversationError);
    socket.on("conversation:created", onConversationCreated);
    socket.on("conversation:closed", onConversationClosed);
    socket.on("conversation:transferred", onConversationTransferred);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:error", onMessageError);
      socket.off("conversation:error", onConversationError);
      socket.off("conversation:created", onConversationCreated);
      socket.off("conversation:closed", onConversationClosed);
      socket.off("conversation:transferred", onConversationTransferred);
    };
  }, [
    socket,
    refresh,
    refreshParticipants,
    selectedConversationId,
    setMessages,
    conversations,
    participantsById,
  ]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text) return;
    if (!selectedConversationId) {
      if (!user || user.role !== "customer") return;

      setDraft("");

      try {
        const result = await conversationsApi.createConversation({
          customerId: user.id,
          initialMessage: text,
          type: "private",
        });
        setSelectedConversationId(result.conversationId);
        await refresh();
      } catch (error) {
        setDraft(text);
        console.error("Failed to create conversation from chatbox", error);
        toast.error(resolveErrorMessage(error, "toasts.createConversationFailed"));
      }
      return;
    }

    if (!canSendMessage) return;

    setDraft("");

    if (socket && socketStatus === "connected") {
      socket.emit("message:send", {
        conversationId: selectedConversationId,
        text,
      });
      return;
    }

    try {
      await sendMessageHttp({ conversationId: selectedConversationId, text });
    } catch (error) {
      setDraft(text);
      console.error("Failed to send message (HTTP)", error);
      toast.error(resolveErrorMessage(error, "toasts.messageSendFailed"));
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversationId) return;

    try {
      await closeConversation(selectedConversationId);
      toast.success(tMessages("toasts.conversationClosed"));
      setIsCloseDialogOpen(false);
      await refresh();
      onConversationClosed?.(selectedConversationId);
    } catch (error) {
      console.error("Failed to close conversation", error);
      toast.error(resolveErrorMessage(error, "toasts.closeConversationFailed"));
    }
  };

  if (isUserLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const showFloatingLauncher = isFloating && !isOpen;
  const showCard = !isFloating || isOpen;
  const canStartConversation = user.role === "customer";

  return (
    <>
      {showFloatingLauncher ? (
        <Button
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:!bg-primary hover:cursor-pointer"
          onClick={() => setIsOpen(true)}
          aria-label={tMessages("chatbox.aria.openMessaging")}
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      ) : null}

      {showCard ? (
        <Card
          className={[
            "py-0 gap-0 flex flex-col",
            isFloating
              ? "fixed bottom-6 right-6 z-50 w-[380px] h-[520px] shadow-xl"
              : "w-full h-[600px] shadow-xl",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CardHeader className="border-b py-4 px-4">
            <div className="flex items-start justify-between gap-4 py-0">
              <div className="min-w-0">
                {onBack && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 mb-2"
                    onClick={onBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {tCommon("back")}
                  </Button>
                )}
                <CardTitle className="text-base">
                  {selectedConversation?.subject ?? tMessages("title")}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      socketStatus === "connected" ? "default" : "secondary"
                    }
                    className="gap-1"
                  >
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        socketStatus === "connected"
                          ? "bg-green-500"
                          : socketStatus === "connecting"
                          ? "bg-yellow-500"
                          : socketStatus === "error"
                          ? "bg-red-500"
                          : "bg-muted-foreground",
                      ].join(" ")}
                    />
                    {socketStatus === "connected"
                      ? tMessages("socket.online")
                      : socketStatus === "connecting"
                      ? tMessages("socket.connecting")
                      : socketStatus === "error"
                      ? tMessages("socket.error")
                      : tMessages("socket.offline")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canCloseConversation && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsCloseDialogOpen(true)}
                    disabled={isClosingConversation}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {tMessages("actions.closeConversation")}
                  </Button>
                )}

                {isFloating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-fit h-fit hover:!bg-transparent hover:cursor-pointer"
                    onClick={() => setIsOpen(false)}
                    aria-label={tMessages("chatbox.aria.closeMessaging")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isFloating && openConversations.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Select
                  value={selectedConversationId}
                  onValueChange={setSelectedConversationId}
                  disabled={isConversationsLoading || openConversations.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue
                      placeholder={
                        isConversationsLoading
                          ? tMessages("select.loading")
                          : openConversations.length === 0
                          ? tMessages("select.noOpen")
                          : tMessages("select.placeholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {openConversations.map((conversation) => {
                      const type = conversation.type ?? "PRIVATE";
                      const label =
                        conversation.subject?.trim() ||
                        (type === "GROUP"
                          ? tMessages("types.group")
                          : tMessages("types.private"));
                      const unread = unreadByConversationId[conversation.id] ?? 0;

                      return (
                        <SelectItem key={conversation.id} value={conversation.id}>
                          <span className="flex items-center justify-between gap-3 w-full">
                            <span className="truncate">{label}</span>
                            {unread > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{unread}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedConversation && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {isParticipantsLoading
                    ? tMessages("participants.loading")
                    : otherParticipants.length === 0
                    ? selectedConversation?.type?.toUpperCase() === "PRIVATE" &&
                      user.role === "customer"
                      ? tMessages("participants.waitingAdvisor")
                      : tMessages("participants.unavailable")
                    : tMessages("participants.label")}
                </p>
                {!isParticipantsLoading && otherParticipants.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {otherParticipants.map((participant) => {
                      const isManager = participant.role === "bankManager";
                      const roleLabel =
                        participant.role === "customer"
                          ? tMessages("roles.customer")
                          : participant.role === "bankAdvisor"
                          ? tMessages("roles.bankAdvisor")
                          : tMessages("roles.bankManager");
                      return (
                        <Badge
                          key={participant.id}
                          variant="outline"
                          className={
                            isManager
                              ? "border-amber-300 text-amber-700 dark:border-amber-900 dark:text-amber-300"
                              : undefined
                          }
                        >
                          {participant.firstname} {participant.lastname} •{" "}
                          {roleLabel}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4">
              {isMessagesLoading ? (
                <p className="text-sm text-muted-foreground">
                  {tMessages("chatbox.loadingMessages")}
                </p>
              ) : !selectedConversation ? (
                <p className="text-sm text-muted-foreground">
                  {canStartConversation
                    ? tMessages("chatbox.empty.noConversationCustomer")
                    : tMessages("chatbox.empty.selectConversation")}
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tMessages("chatbox.empty.noMessagesYet")}
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user.id;
                    const isManager = message.senderRole === "bankManager";
                    const sender = participantsById.get(message.senderId);
                    const senderLabel = sender
                      ? `${sender.firstname} ${sender.lastname}`
                      : isManager
                      ? tMessages("roles.bankManager")
                      : tMessages("roles.counterpart");

                    const bubbleClass = [
                      "max-w-[85%] rounded-lg p-3 border",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : isManager
                        ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900"
                        : "bg-muted",
                      isManager && !isOwnMessage ? "shadow-sm" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className={bubbleClass}>
                          {!isOwnMessage && (
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-medium opacity-70">
                                {senderLabel}
                              </p>
                              {isManager && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-300 text-amber-700 dark:text-amber-300"
                                >
                                  {tMessages("roles.bankManager")}
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>

                          <p
                            className={`text-[11px] mt-2 ${
                              isOwnMessage
                                ? "opacity-70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.sentAt), "HH:mm", {
                              locale: dateLocale,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="border-t p-3">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder={
                  selectedConversation
                    ? canSendMessage
                      ? tMessages("chatbox.input.placeholder.write")
                      : tMessages("chatbox.input.placeholder.cannotWrite")
                    : canStartConversation
                    ? tMessages("chatbox.input.placeholder.write")
                    : tMessages("chatbox.input.placeholder.selectConversation")
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={
                  selectedConversation
                    ? !canSendMessage || isSendingHttp
                    : !canStartConversation || isSendingHttp
                }
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={
                  (selectedConversation
                    ? !canSendMessage
                    : !canStartConversation) ||
                  isSendingHttp ||
                  !draft.trim()
                }
                aria-label={tMessages("chatbox.aria.send")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tMessages("dialogs.closeConversation.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tMessages("dialogs.closeConversation.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosingConversation}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConversation}
              disabled={isClosingConversation}
            >
              {isClosingConversation ? tMessages("actions.closing") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
