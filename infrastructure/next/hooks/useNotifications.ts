"use client"

import { useState, useCallback, useEffect } from "react"
import { notificationsApi } from "@/api/notifications"
import { NotificationWithUser } from "@/types/notifications"
import { ApiError } from "@/lib/errors"
import { useCurrentUser } from "./useCurrentUser"

type UseNotificationsState = {
  notifications: NotificationWithUser[]
  isLoading: boolean
  error: ApiError | null
  unreadCount: number
}

export function useNotifications() {
  const { user } = useCurrentUser()
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    isLoading: false,
    error: null,
    unreadCount: 0,
  })

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const notifications = await notificationsApi.getNotifications()
      const unreadCount = notifications.filter((n) => n.status === "unread").length

      setState({
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof ApiError
            ? error
            : new ApiError("INFRASTRUCTURE_ERROR", "An error occurred"),
      }))
    }
  }, [user?.id])

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return

    try {
      const count = await notificationsApi.getUnreadCount()
      setState((prev) => ({ ...prev, unreadCount: count }))
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }, [user?.id])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsApi.markAsRead(notificationId)
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, status: "read" as const } : n
          ),
          unreadCount: prev.unreadCount - 1,
        }))
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    },
    []
  )

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== notificationId),
      }))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }, [])

  const addNotification = useCallback((notification: NotificationWithUser) => {
    setState((prev) => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      unreadCount:
        notification.status === "unread" ? prev.unreadCount + 1 : prev.unreadCount,
    }))
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const refresh = useCallback(() => {
    return fetchNotifications()
  }, [fetchNotifications])

  return {
    ...state,
    refresh,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    addNotification,
  }
}
