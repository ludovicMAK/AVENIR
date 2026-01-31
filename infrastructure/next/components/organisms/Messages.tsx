"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { conversationsApi, type Message } from "@/api/conversations";
import { useConversations, useCreateConversation } from "@/hooks/useConversations";
import { ApiError } from "@/lib/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { Badge } from "@/components/atoms/Badge";
import { Skeleton } from "@/components/atoms/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useUser } from "@/lib/auth/UserContext";
import { Input } from "@/components/atoms/Input";
import { useI18n, useTranslations } from "@/lib/i18n/simple-i18n";

export default function Messages() {
  const router = useRouter();
  const { user } = useUser();
  const tMessages = useTranslations("messages");
  const tCommon = useTranslations("common");
  const { locale } = useI18n();
  const dateLocale = locale === "fr" ? fr : enUS;
  const dateTimeFormat =
    locale === "fr" ? "dd MMMM yyyy à HH:mm" : "dd MMMM yyyy 'at' HH:mm";
  const { conversations, isLoading, refresh } = useConversations();
  const { createConversation, isLoading: creatingCustomer } = useCreateConversation();

  const [newConversationDialog, setNewConversationDialog] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [newGroupConversationDialog, setNewGroupConversationDialog] =
    useState(false);
  const [groupSubject, setGroupSubject] = useState("");
  const [groupInitialMessage, setGroupInitialMessage] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [lastMessageByConversationId, setLastMessageByConversationId] = useState<
    Record<string, Message | null>
  >({});

  const canCreateConversationAsCustomer = user?.role === "customer";
  const canCreateConversation = canCreateConversationAsCustomer;
  const canCreateGroupConversation =
    user?.role === "bankAdvisor" || user?.role === "bankManager";
  const creating = creatingCustomer;

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

  useEffect(() => {
    if (!user) return;
    if (conversations.length === 0) return;

    const conversationIdsToFetch = conversations
      .map((conversation) => conversation.id)
      .filter((conversationId) => !(conversationId in lastMessageByConversationId));

    if (conversationIdsToFetch.length === 0) return;

    let cancelled = false;

    const fetchLastMessages = async () => {
      const entries = await Promise.all(
        conversationIdsToFetch.map(async (conversationId) => {
          try {
            const messages = await conversationsApi.getMessages(conversationId);
            const last = messages.length > 0 ? messages[messages.length - 1] : null;
            return [conversationId, last] as const;
          } catch (error) {
            console.error(
              "Failed to load last message for conversation",
              conversationId,
              error
            );
            return [conversationId, null] as const;
          }
        })
      );

      if (cancelled) return;

      setLastMessageByConversationId((prev) => {
        const next = { ...prev };
        for (const [conversationId, message] of entries) {
          next[conversationId] = message;
        }
        return next;
      });
    };

    void fetchLastMessages();

    return () => {
      cancelled = true;
    };
  }, [conversations, lastMessageByConversationId, user]);

  useEffect(() => {
    if (newConversationDialog) return;
    setInitialMessage("");
  }, [newConversationDialog]);

  useEffect(() => {
    if (newGroupConversationDialog) return;
    setGroupSubject("");
    setGroupInitialMessage("");
  }, [newGroupConversationDialog]);

  const getLastMessagePreview = (conversationId: string): string => {
    const message = lastMessageByConversationId[conversationId];

    if (message === undefined) {
      return tMessages("preview.loadingLastMessage");
    }

    if (!message) {
      return tMessages("noMessages");
    }

    return message.content.replace(/\s+/g, " ").trim();
  };

  const formatConversationDate = (date: string | undefined): string => {
    if (!date) return tMessages("preview.unknownDate");
    return format(new Date(date), dateTimeFormat, { locale: dateLocale });
  };

  const getConversationTypeLabel = (type: string | undefined): string =>
    type?.toUpperCase() === "GROUP"
      ? tMessages("types.group")
      : tMessages("types.private");

  const getConversationDateLabel = (conversation: {
    createdAt?: string;
    closedAt?: string;
  }): string => {
    if (conversation.closedAt) {
      return `${tMessages("closedOn")} ${formatConversationDate(conversation.closedAt)}`;
    }
    return `${tMessages("openedOn")} ${formatConversationDate(conversation.createdAt)}`;
  };

  const getConversationCardClassName = (status: string): string => {
    switch (status) {
      case "transferred":
        return "opacity-80";
      case "closed":
        return "opacity-75";
      default:
        return "";
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(tMessages("toasts.userNotConnected"));
      return;
    }

    if (!canCreateConversation) {
      toast.error(tMessages("toasts.cannotCreateConversation"));
      return;
    }

    if (!initialMessage.trim()) {
      toast.error(tMessages("toasts.fillAllFields"));
      return;
    }

    try {
      const result = await createConversation({
        initialMessage: initialMessage.trim(),
        type: "private",
      });
      toast.success(tMessages("toasts.conversationCreated"));
      setNewConversationDialog(false);
      setInitialMessage("");
      refresh();
      router.push(`/dashboard/messages/${result.conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation", error);
      toast.error(resolveErrorMessage(error, "toasts.createConversationFailed"));
    }
  };

  const handleCreateGroupConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canCreateGroupConversation) {
      toast.error(tMessages("toasts.cannotCreateGroupConversation"));
      return;
    }

    const text = groupInitialMessage.trim();
    if (!text) {
      toast.error(tMessages("toasts.fillAllFields"));
      return;
    }

    setIsCreatingGroup(true);
    try {
      const result = await conversationsApi.createGroupConversation({
        creatorId: user.id,
        subject: groupSubject.trim() ? groupSubject.trim() : undefined,
        initialMessage: text,
      });
      toast.success(tMessages("toasts.groupCreated"));
      setNewGroupConversationDialog(false);
      setGroupSubject("");
      setGroupInitialMessage("");
      refresh();
      router.push(`/dashboard/messages/${result.conversationId}`);
    } catch (error) {
      console.error("Failed to create group conversation", error);
      toast.error(resolveErrorMessage(error, "toasts.createGroupFailed"));
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="default" className="gap-1">
            <Clock className="h-3 w-3" />
            {tMessages("open")}
          </Badge>
        );
      case "transferred":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-300 text-amber-700 dark:border-amber-900 dark:text-amber-300"
          >
            <XCircle className="h-3 w-3" />
            {tMessages("transferred")}
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {tMessages("closed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{tMessages("title")}</h1>
          <p className="text-muted-foreground">
            {tMessages("subtitleLoading")}
          </p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const openConversations = conversations.filter((c) => c.status === "open");
  const transferredConversations = conversations.filter(
    (c) => c.status === "transferred"
  );
  const closedConversations = conversations.filter((c) => c.status === "closed");

  const conversationSections = [
    { title: tMessages("sections.open"), items: openConversations },
    { title: tMessages("sections.transferred"), items: transferredConversations },
    { title: tMessages("sections.closed"), items: closedConversations },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tMessages("title")}</h1>
          <p className="text-muted-foreground">
            {user?.role === "customer"
              ? tMessages("subtitleCustomer")
              : user?.role === "bankAdvisor"
              ? tMessages("subtitleAdvisor")
              : user?.role === "bankManager"
              ? tMessages("subtitleManager")
              : tMessages("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateGroupConversation && (
            <Button
              variant="outline"
              onClick={() => setNewGroupConversationDialog(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              {tMessages("newGroupConversation")}
            </Button>
          )}
          {canCreateConversation && (
            <Button onClick={() => setNewConversationDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {tMessages("newConversation")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{tMessages("stats.total")}</CardDescription>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{tMessages("stats.open")}</CardDescription>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openConversations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{tMessages("stats.transferred")}</CardDescription>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transferredConversations.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{tMessages("stats.closed")}</CardDescription>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {closedConversations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {tMessages("empty.title")}
            </p>
            <p className="text-muted-foreground mb-6">
              {canCreateConversationAsCustomer
                ? tMessages("empty.customerDescription")
                : tMessages("empty.defaultDescription")}
            </p>
            <div className="flex items-center justify-center gap-2">
              {canCreateGroupConversation && (
                <Button
                  variant="outline"
                  onClick={() => setNewGroupConversationDialog(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {tMessages("newGroupConversation")}
                </Button>
              )}
              {canCreateConversation && (
                <Button onClick={() => setNewConversationDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tMessages("newConversation")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {conversationSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.items.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={[
                    "hover:shadow-lg transition-shadow cursor-pointer",
                    getConversationCardClassName(conversation.status),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    router.push(`/dashboard/messages/${conversation.id}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {conversation.subject?.trim()
                            ? conversation.subject
                            : getConversationTypeLabel(conversation.type)}
                        </CardTitle>
                        <CardDescription className="w-full flex flex-row gap-2">
                          <span>{getConversationDateLabel(conversation)}</span>
                          <span>•</span>
                          <span>{getConversationTypeLabel(conversation.type)}</span>
                        </CardDescription>
                      </div>
                      {getStatusBadge(conversation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground truncate">
                        {getLastMessagePreview(conversation.id)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={newConversationDialog}
        onOpenChange={setNewConversationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tMessages("dialogs.newConversation.title")}</DialogTitle>
            <DialogDescription>
              {tMessages("dialogs.newConversation.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateConversation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">{tMessages("dialogs.newConversation.messageLabel")}</Label>
              <Textarea
                id="message"
                placeholder={tMessages("dialogs.newConversation.messagePlaceholder")}
                rows={5}
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewConversationDialog(false)}
                disabled={creating}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  creating ||
                  !initialMessage.trim()
                }
              >
                {creating ? tMessages("actions.creating") : tMessages("actions.createConversation")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newGroupConversationDialog}
        onOpenChange={setNewGroupConversationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tMessages("dialogs.newGroup.title")}</DialogTitle>
            <DialogDescription>
              {tMessages("dialogs.newGroup.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroupConversation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupSubject">{tMessages("dialogs.newGroup.groupNameLabel")}</Label>
              <Input
                id="groupSubject"
                value={groupSubject}
                onChange={(e) => setGroupSubject(e.target.value)}
                placeholder={tMessages("dialogs.newGroup.groupNamePlaceholder")}
                disabled={isCreatingGroup}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupMessage">{tMessages("dialogs.newGroup.initialMessageLabel")}</Label>
              <Textarea
                id="groupMessage"
                rows={4}
                value={groupInitialMessage}
                onChange={(e) => setGroupInitialMessage(e.target.value)}
                placeholder={tMessages("dialogs.newGroup.initialMessagePlaceholder")}
                disabled={isCreatingGroup}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewGroupConversationDialog(false)}
                disabled={isCreatingGroup}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isCreatingGroup || !groupInitialMessage.trim()}
              >
                {isCreatingGroup ? tMessages("actions.creating") : tMessages("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
