"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConversations, useCreateConversation } from "@/hooks/useConversations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MessagesClient() {
  const router = useRouter();
  const { conversations, isLoading, refresh } = useConversations();
  const { createConversation, isLoading: creating } = useCreateConversation();

  const [newConversationDialog, setNewConversationDialog] = useState(false);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !initialMessage) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await createConversation({ subject, initialMessage });
      toast.success("Conversation créée avec succès");
      setNewConversationDialog(false);
      setSubject("");
      setInitialMessage("");
      refresh();
      router.push(`/dashboard/messages/${result.conversationId}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la conversation"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="default" className="gap-1">
            <Clock className="h-3 w-3" />
            Ouverte
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Fermée
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
          <h1 className="text-3xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground">
            Communiquez avec vos conseillers bancaires
          </p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const openConversations = conversations.filter((c) => c.status === "open");
  const closedConversations = conversations.filter((c) => c.status === "closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground">
            Communiquez avec vos conseillers bancaires
          </p>
        </div>
        <Button onClick={() => setNewConversationDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total</CardDescription>
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
              <CardDescription>Ouvertes</CardDescription>
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
              <CardDescription>Fermées</CardDescription>
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
              Aucune conversation pour le moment
            </p>
            <p className="text-muted-foreground mb-6">
              Commencez une conversation avec un conseiller bancaire
            </p>
            <Button onClick={() => setNewConversationDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {openConversations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Conversations ouvertes</h2>
              {openConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/messages/${conversation.id}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {conversation.subject}
                        </CardTitle>
                        <CardDescription>
                          Créée le{" "}
                          {conversation.createdAt ? (
                            format(
                              new Date(conversation.createdAt),
                              "dd MMMM yyyy à HH:mm",
                              { locale: fr }
                            )
                          ) : (
                            "Date inconnue"
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(conversation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {conversation.assignedAdvisorId ? (
                          <span>Conseiller assigné</span>
                        ) : (
                          <span>En attente d&apos;attribution</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Voir la conversation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {closedConversations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Conversations fermées</h2>
              {closedConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer opacity-75"
                  onClick={() =>
                    router.push(`/dashboard/messages/${conversation.id}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {conversation.subject}
                        </CardTitle>
                        <CardDescription>
                          {conversation.closedAt ? (
                            <>
                              Fermée le{" "}
                              {format(
                                new Date(conversation.closedAt),
                                "dd MMMM yyyy à HH:mm",
                                { locale: fr }
                              )}
                            </>
                          ) : (
                            "En cours"
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(conversation.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog
        open={newConversationDialog}
        onOpenChange={setNewConversationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Commencez une conversation avec un conseiller bancaire
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateConversation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="Ex: Question sur mon compte épargne"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Décrivez votre demande..."
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
                Annuler
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Création..." : "Créer la conversation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
