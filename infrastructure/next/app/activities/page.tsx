"use client"

import { useState } from "react"
import { useActivities } from "@/hooks/useActivities"
import { useSSEActivities } from "@/hooks/useSSEActivities"
import { Activity, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type ActivityPriority = "low" | "medium" | "high"

export default function ActivitiesPage() {
  const [priorityFilter, setPriorityFilter] = useState<ActivityPriority | "all">("all")
  const { activities, isLoading, error, addActivity, refresh } =
    useActivities()

  useSSEActivities({
    onActivity: (activity) => {
      addActivity(activity)
    },
  })

  const filteredActivities = activities.filter((a) => {
    if (priorityFilter === "all") return true
    return a.priority === priorityFilter
  })

  const priorityCounts = {
    low: activities.filter((a) => a.priority === "low").length,
    medium: activities.filter((a) => a.priority === "medium").length,
    high: activities.filter((a) => a.priority === "high").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Activités récentes</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-full">
                {activities.length}
              </span>
            </div>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtre par priorité</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPriorityFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                priorityFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tous ({activities.length})
            </button>
            <button
              onClick={() => setPriorityFilter("high")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                priorityFilter === "high"
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-700 border border-red-300 hover:bg-red-50"
              }`}
            >
              Haute ({priorityCounts.high})
            </button>
            <button
              onClick={() => setPriorityFilter("medium")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                priorityFilter === "medium"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
              }`}
            >
              Moyenne ({priorityCounts.medium})
            </button>
            <button
              onClick={() => setPriorityFilter("low")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                priorityFilter === "low"
                  ? "bg-gray-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Basse ({priorityCounts.low})
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="mt-4 text-gray-600">Chargement des activités...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Erreur lors du chargement</p>
            <p className="text-red-700 text-sm mt-2">{error.message}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucune activité trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-6 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-all ${
                  activity.priority === "high"
                    ? "border-red-400"
                    : activity.priority === "medium"
                      ? "border-blue-400"
                      : "border-gray-400"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      activity.priority === "high"
                        ? "bg-red-100"
                        : activity.priority === "medium"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }`}
                  >
                    <Activity
                      className={`w-6 h-6 ${
                        activity.priority === "high"
                          ? "text-red-600"
                          : activity.priority === "medium"
                            ? "text-blue-600"
                            : "text-gray-600"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Par: {activity.author?.firstName} {activity.author?.lastName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
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

                    <p className="text-xs text-gray-500 mb-3">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>

                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium text-gray-600">{key}:</span>
                              <span className="text-gray-500 ml-1">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
