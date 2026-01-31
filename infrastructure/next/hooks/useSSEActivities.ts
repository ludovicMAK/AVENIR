"use client"

import { useEffect } from "react"
import { activitiesApi } from "@/api/notifications"
import { ActivityFeed } from "@/types/notifications"
import { useCurrentUser } from "./useCurrentUser"

type UseSSEActivitiesOptions = {
  onActivity?: (activity: ActivityFeed) => void
  onError?: (error: Error) => void
}

export function useSSEActivities(options?: UseSSEActivitiesOptions) {
  const { user } = useCurrentUser()

  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = activitiesApi.subscribeToActivities(
      (activity) => {
        options?.onActivity?.(activity)
      },
      (error) => {
        console.error("SSE activities error:", error)
        options?.onError?.(error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user?.id, options])
}
