"use client"

import { Activity, Zap } from "lucide-react"
import { useActivities } from "@/hooks/useActivities"
import { useSSEActivities } from "@/hooks/useSSEActivities"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const activityIcons = {
  low: "bg-gray-100",
  medium: "bg-blue-100",
  high: "bg-red-100",
}

const activityPriorityColors = {
  low: "text-gray-600",
  medium: "text-blue-600",
  high: "text-red-600",
}

interface ActivityFeedProps {
  limit?: number
  showRecent?: boolean
}

export function ActivityFeed({ limit = 10, showRecent = true }: ActivityFeedProps) {
  const { activities, isLoading, error, addActivity, fetchRecentActivities } = useActivities()

  useSSEActivities({
    onActivity: (activity) => {
      addActivity(activity)
    },
  })

  const displayActivities = showRecent ? activities.slice(0, limit) : activities

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">
          <Zap className="w-6 h-6 text-blue-600" />
        </div>
        <span className="ml-2 text-gray-600">Chargement des activités...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Erreur lors du chargement des activités</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Activités récentes
        </h2>
        {displayActivities.length > 0 && showRecent && (
          <button
            onClick={() => fetchRecentActivities(50)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir plus
          </button>
        )}
      </div>

      {displayActivities.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune activité pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  activityIcons[activity.priority]
                }`}
              >
                <Activity className={`w-5 h-5 ${activityPriorityColors[activity.priority]}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Par: {activity.author?.firstName} {activity.author?.lastName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                      activity.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : activity.priority === "medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {activity.priority}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>

                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
