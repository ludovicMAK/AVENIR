"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessages, useSendMessage, useCloseConversation } from "@/hooks/useConversations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Message } from "@/api/conversations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatClientProps {
  conversationId: string;
}

export default function ChatClient({ conversationId }: ChatClientProps) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { messages, isLoading, setMessages } = useMessages(conversationId);
  const { sendMessage, isLoading: sending } = useSendMessage();
  const { closeConversation, isLoading: closing } = useCloseConversation();

  const [messageContent, setMessageContent] = useState("");
  const [closeDialog, setCloseDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      return;
    }

    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            type: "subscribe",
            conversationId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "new_message" && data.message) {
            const newMessage: Message = data.message;
            if (newMessage.conversationId === conversationId) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message", error);
        }
      };

      ws.onerror = () => {
        console.warn("WebSocket error, falling back to polling");
      };

      ws.onclose = () => {
        console.info("WebSocket disconnected");
      };
    } catch (error) {
      console.error("Could not establish WebSocket connection", error);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(
            JSON.stringify({
              type: "unsubscribe",
              conversationId,
            })
          );
          ws.close();
        } catch (error) {
          console.error("Error closing WebSocket", error);
        }
      }
    };
  }, [conversationId, setMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      return;
    }

    try {
      await sendMessage({
        conversationId,
        content: messageContent,
      });
      setMessageContent("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du message"
      );
    }
  };

  const handleCloseConversation = async () => {
    try {
      await closeConversation(conversationId);
      toast.success("Conversation fermée");
      setCloseDialog(false);
      router.push("/dashboard/messages");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la fermeture de la conversation"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Conversation</h1>
            <p className="text-sm text-muted-foreground">
              {messages.length} message{messages.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setCloseDialog(true)}>
          <X className="mr-2 h-4 w-4" />
          Fermer la conversation
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Conversation en temps réel avec votre conseiller
              </CardDescription>
            </div>
            <Badge variant="default" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              En ligne
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun message pour le moment. Commencez la conversation !
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!isOwnMessage && message.senderName && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          isOwnMessage ? "opacity-70" : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(message.sentAt), "HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <CardContent className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Écrivez votre message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !messageContent.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={closeDialog} onOpenChange={setCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer la conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir fermer cette conversation ? Vous ne
              pourrez plus envoyer de messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseConversation} disabled={closing}>
              {closing ? "Fermeture..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
