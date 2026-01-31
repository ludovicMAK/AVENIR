"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { Bell, Trash2, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type NotificationFilter = "all" | "unread" | "info" | "warning" | "error" | "news"

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    addNotification,
    markAsRead,
    deleteNotification,
    refresh,
  } = useNotifications()

  useSSENotifications({
    onNotification: (notification) => {
      addNotification(notification)
    },
  })

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return n.status === "unread"
    if (filter in ["info", "warning", "error", "news"]) return n.type === filter
    return true
  })

  const handleMarkAllAsRead = async () => {
    for (const n of notifications.filter((n) => n.status === "unread")) {
      await markAsRead(n.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                  {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                </span>
              )}
            </div>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Marquer tous comme lus
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "unread", "info", "warning", "error", "news"] as NotificationFilter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f === "all"
                  ? "Tous"
                  : f === "unread"
                    ? "Non lus"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <p className="mt-4 text-gray-600">Chargement des notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Erreur lors du chargement</p>
            <p className="text-red-700 text-sm mt-2">{error.message}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 rounded-lg border-l-4 transition-all ${
                  notification.type === "info"
                    ? "bg-blue-50 border-blue-400"
                    : notification.type === "warning"
                      ? "bg-yellow-50 border-yellow-400"
                      : notification.type === "error"
                        ? "bg-red-50 border-red-400"
                        : "bg-green-50 border-green-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notification.type === "info"
                            ? "bg-blue-100 text-blue-800"
                            : notification.type === "warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : notification.type === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {notification.type}
                      </span>
                      {notification.status === "unread" && (
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        De: {notification.sender?.firstName} {notification.sender?.lastName}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === "unread" && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Marquer comme lu"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
