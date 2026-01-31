import { Response } from "express"
import { Notification } from "@domain/entities/notification"
import { Activity } from "@domain/entities/activity"

export interface SSEClient {
  userId: string
  response: Response
  subscriptionType: "notifications" | "activities" | "all"
}

export class SSEService {
  private clients: Map<string, SSEClient[]> = new Map()

  /**
   * Ajoute un client SSE connecté
   */
  addClient(
    userId: string,
    response: Response,
    subscriptionType: "notifications" | "activities" | "all" = "all"
  ): string {
    const clientId = `${userId}-${Date.now()}-${Math.random()}`

    if (!this.clients.has(userId)) {
      this.clients.set(userId, [])
    }

    this.clients.get(userId)!.push({
      userId,
      response,
      subscriptionType,
    })

    // Configurer les headers SSE
    response.setHeader("Content-Type", "text/event-stream")
    response.setHeader("Cache-Control", "no-cache")
    response.setHeader("Connection", "keep-alive")
    response.setHeader("Access-Control-Allow-Origin", "*")

    // Envoyer un ping initial
    response.write("data: {\"type\":\"connected\"}\n\n")

    // Gérer la déconnexion du client
    response.on("close", () => {
      this.removeClient(userId, response)
    })

    return clientId
  }

  /**
   * Supprime un client SSE
   */
  private removeClient(userId: string, response: Response): void {
    const userClients = this.clients.get(userId)
    if (userClients) {
      const index = userClients.findIndex((client) => client.response === response)
      if (index !== -1) {
        userClients.splice(index, 1)
      }
      if (userClients.length === 0) {
        this.clients.delete(userId)
      }
    }
  }

  /**
   * Envoie une notification à un user
   */
  sendNotification(userId: string, notification: Notification): void {
    this.sendEventToUser(userId, "notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type.getValue(),
      status: notification.status.getValue(),
      sentAt: notification.sentAt,
    })
  }

  /**
   * Envoie une activité/actualité à tous les users
   */
  broadcastActivity(activity: Activity, authorName: string): void {
    const event = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      authorName,
      priority: activity.priority.getValue(),
      createdAt: activity.createdAt,
    }

    // Envoyer à tous les clients connectés
    for (const [, userClients] of this.clients.entries()) {
      for (const client of userClients) {
        if (client.subscriptionType === "activities" || client.subscriptionType === "all") {
          client.response.write(`data: ${JSON.stringify({ type: "activity", data: event })}\n\n`)
        }
      }
    }
  }

  /**
   * Envoie une activité à des users spécifiques (optionnel - pour des activités ciblées)
   */
  sendActivityToUsers(userIds: string[], activity: Activity, authorName: string): void {
    const event = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      authorName,
      priority: activity.priority.getValue(),
      createdAt: activity.createdAt,
    }

    for (const userId of userIds) {
      this.sendEventToUser(userId, "activity", event)
    }
  }

  /**
   * Envoie un événement à un user spécifique
   */
  private sendEventToUser(
    userId: string,
    type: string,
    data: Record<string, unknown>
  ): void {
    const userClients = this.clients.get(userId)
    if (userClients) {
      for (const client of userClients) {
        try {
          client.response.write(
            `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`
          )
        } catch (error) {
          console.error(`Error sending SSE to user ${userId}:`, error)
          this.removeClient(userId, client.response)
        }
      }
    }
  }

  /**
   * Retourne le nombre de clients connectés
   */
  getConnectedClientsCount(): number {
    let count = 0
    for (const clients of this.clients.values()) {
      count += clients.length
    }
    return count
  }

  /**
   * Retourne le nombre de clients connectés pour un user
   */
  getUserConnectedClientsCount(userId: string): number {
    return this.clients.get(userId)?.length || 0
  }

  /**
   * Nettoie tous les clients
   */
  cleanup(): void {
    for (const [, userClients] of this.clients.entries()) {
      for (const client of userClients) {
        try {
          client.response.end()
        } catch (error) {
          console.error("Error closing SSE response:", error)
        }
      }
    }
    this.clients.clear()
  }
}
