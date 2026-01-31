"use client"

import { ActivityFeed } from "@/components/molecules/ActivityFeed"
import { useNotifications } from "@/hooks/useNotifications"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { Bell } from "lucide-react"

export default function DashboardContent() {
  const { unreadCount } = useNotifications()

  // Subscribe aux notifications en temps réel
  useSSENotifications({
    onNotification: (notification) => {
      // Vous pouvez ajouter une toast notification ici
      console.log("Nouvelle notification reçue:", notification.title)
    },
  })

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue!</h1>
          <p className="text-gray-600 mt-1">Gérez votre banque en ligne AVENIR</p>
        </div>

        {/* Notification Alert */}
        {unreadCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non-lue{unreadCount > 1 ? "s" : ""}
              </p>
              <a href="/notifications" className="text-blue-600 hover:text-blue-800 text-sm">
                Voir toutes les notifications →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Accounts & Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comptes Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Vos Comptes</h2>
            <p className="text-gray-600">Liste de vos comptes bancaires...</p>
            {/* Votre contenu de comptes ici */}
          </div>

          {/* Autres Sections */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Transactions Récentes</h2>
            <p className="text-gray-600">Vos dernières transactions...</p>
            {/* Votre contenu de transactions ici */}
          </div>
        </div>

        {/* Right: Activities Sidebar (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-20">
            {/* Affiche les 5 activités récentes */}
            <ActivityFeed limit={5} showRecent={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
