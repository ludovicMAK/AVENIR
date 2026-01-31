"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"

export function NotificationBell() {
  const { unreadCount, addNotification, markAsRead } = useNotifications()

  useSSENotifications({
    onNotification: (notification) => {
      addNotification(notification)
    },
  })

  return (
    <div className="relative cursor-pointer">
      <Bell className="w-6 h-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  )
}
