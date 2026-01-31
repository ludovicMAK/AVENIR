"use client"

import { useState, useCallback, useEffect } from "react"
import { activitiesApi } from "@/api/notifications"
import { ActivityFeed } from "@/types/notifications"
import { ApiError } from "@/lib/errors"
import { useCurrentUser } from "./useCurrentUser"

type UseActivitiesState = {
  activities: ActivityFeed[]
  isLoading: boolean
  error: ApiError | null
}

export function useActivities() {
  const { user } = useCurrentUser()
  const [state, setState] = useState<UseActivitiesState>({
    activities: [],
    isLoading: false,
    error: null,
  })

  const fetchActivities = useCallback(async () => {
    if (!user?.id) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const activities = await activitiesApi.getActivities()
      setState({
        activities,
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

  const fetchRecentActivities = useCallback(
    async (limit: number = 10) => {
      if (!user?.id) return

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const activities = await activitiesApi.getRecentActivities(limit)
        setState({
          activities,
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
    },
    [user?.id]
  )

  const addActivity = useCallback((activity: ActivityFeed) => {
    setState((prev) => ({
      ...prev,
      activities: [activity, ...prev.activities],
    }))
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const refresh = useCallback(() => {
    return fetchActivities()
  }, [fetchActivities])

  return {
    ...state,
    refresh,
    fetchActivities,
    fetchRecentActivities,
    addActivity,
  }
}
