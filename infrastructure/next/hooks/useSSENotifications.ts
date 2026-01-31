"use client"

import { useEffect } from "react"
import { notificationsApi } from "@/api/notifications"
import { NotificationWithUser } from "@/types/notifications"
import { useCurrentUser } from "./useCurrentUser"

type UseSSENotificationsOptions = {
  onNotification?: (notification: NotificationWithUser) => void
  onError?: (error: Error) => void
}

export function useSSENotifications(options?: UseSSENotificationsOptions) {
  const { user } = useCurrentUser()

  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = notificationsApi.subscribeToNotifications(
      (notification) => {
        options?.onNotification?.(notification)
      },
      (error) => {
        console.error("SSE notifications error:", error)
        options?.onError?.(error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user?.id, options])
}
