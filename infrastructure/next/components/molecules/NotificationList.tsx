"use client"

import { useState } from "react"
import { Bell, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const notificationColors = {
  info: "bg-blue-50 border-l-4 border-blue-400",
  warning: "bg-yellow-50 border-l-4 border-yellow-400",
  error: "bg-red-50 border-l-4 border-red-400",
  news: "bg-green-50 border-l-4 border-green-400",
}

const notificationBadges = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  news: "bg-green-100 text-green-800",
}

export function NotificationList() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, addNotification, markAsRead, deleteNotification } =
    useNotifications()

  useSSENotifications({
    onNotification: (notification) => {
      addNotification(notification)
    },
  })

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      notificationColors[notification.type]
                    }`}
                    onClick={() => {
                      if (notification.status === "unread") {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notificationBadges[notification.type]
                            }`}
                          >
                            {notification.type}
                          </span>
                          {notification.status === "unread" && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500">
                            De: {notification.sender?.firstName} {notification.sender?.lastName}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
