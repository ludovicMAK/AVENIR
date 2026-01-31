import { request } from "./client"
import {
  NotificationWithUser,
  ActivityFeed,
} from "@/types/notifications"
import { ApiError } from "@/lib/errors"
import { isJsonObject } from "@/lib/json"
import { getAuthenticationToken } from "@/lib/auth/client"
import { getCurrentUserId } from "./client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

export const notificationsApi = {
  async getNotifications(): Promise<NotificationWithUser[]> {
    const response = await request("/notifications", {
      method: "GET",
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to fetch notifications")
    }

    const data = response.data
    return (Array.isArray(data) ? data : []) as unknown as NotificationWithUser[]
  },

  async getUnreadCount(): Promise<number> {
    const response = await request("/notifications/count", {
      method: "GET",
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to fetch unread count")
    }

    const data = response.data
    if (isJsonObject(data) && typeof data.count === "number") {
      return data.count
    }
    return 0
  },

  async markAsRead(notificationId: string): Promise<void> {
    const response = await request(`/notifications/${notificationId}/read`, {
      method: "POST",
      body: JSON.stringify({}),
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to mark notification as read")
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await request(`/notifications/${notificationId}`, {
      method: "DELETE",
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to delete notification")
    }
  },

  subscribeToNotifications(
    onMessage: (notification: NotificationWithUser) => void,
    onError?: (error: Error) => void
  ): () => void {
    let abortController: AbortController | null = new AbortController()

    const subscribe = async () => {
      try {
        const headers = new Headers({
          "Accept": "text/event-stream",
        })

        // Add auth headers if available
        if (typeof window !== "undefined") {
          const token = getAuthenticationToken()
          const userId = getCurrentUserId()

          if (token) {
            headers.set("Authorization", `Bearer ${token}`)
          }
          if (userId) {
            headers.set("x-user-id", userId)
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
          method: "GET",
          headers,
          credentials: "include",
          signal: abortController?.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("Response body is not readable")
        }

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = line.slice(6)
                const notification = JSON.parse(data) as NotificationWithUser
                onMessage(notification)
              } catch (e) {
                onError?.(new Error("Failed to parse notification"))
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("SSE connection failed:", error)
          onError?.(error)
        }
      }
    }

    subscribe()

    return () => {
      abortController?.abort()
      abortController = null
    }
  },
}

export const activitiesApi = {
  async getActivities(): Promise<ActivityFeed[]> {
    const response = await request("/activities", {
      method: "GET",
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to fetch activities")
    }

    const data = response.data
    return (Array.isArray(data) ? data : []) as unknown as ActivityFeed[]
  },

  async getRecentActivities(limit: number = 10): Promise<ActivityFeed[]> {
    const response = await request(`/activities/recent?limit=${limit}`, {
      method: "GET",
    })

    if (!isJsonObject(response) || !response.ok) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Failed to fetch recent activities")
    }

    const data = response.data
    return (Array.isArray(data) ? data : []) as unknown as ActivityFeed[]
  },

  subscribeToActivities(
    onMessage: (activity: ActivityFeed) => void,
    onError?: (error: Error) => void
  ): () => void {
    let abortController: AbortController | null = new AbortController()

    const subscribe = async () => {
      try {
        const headers = new Headers({
          "Accept": "text/event-stream",
        })

        // Add auth headers if available
        if (typeof window !== "undefined") {
          const token = getAuthenticationToken()
          const userId = getCurrentUserId()

          if (token) {
            headers.set("Authorization", `Bearer ${token}`)
          }
          if (userId) {
            headers.set("x-user-id", userId)
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/activities/subscribe`, {
          method: "GET",
          headers,
          credentials: "include",
          signal: abortController?.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("Response body is not readable")
        }

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = line.slice(6)
                const activity = JSON.parse(data) as ActivityFeed
                onMessage(activity)
              } catch (e) {
                onError?.(new Error("Failed to parse activity"))
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("SSE connection failed:", error)
          onError?.(error)
        }
      }
    }

    subscribe()

    return () => {
      abortController?.abort()
      abortController = null
    }
  },
}
