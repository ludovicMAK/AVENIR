"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { NotificationList } from "@/components/molecules/NotificationList"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Bell, Activity, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold">🏦</div>
            <span className="text-2xl font-bold hidden sm:inline">AVENIR</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="hover:text-blue-100 transition-colors">
              Dashboard
            </Link>

            <Link href="/accounts" className="hover:text-blue-100 transition-colors">
              Comptes
            </Link>

            {/* NOUVEAU: Lien Notifications */}
            <Link
              href="/notifications"
              className="flex items-center gap-2 hover:text-blue-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </Link>

            {/* NOUVEAU: Lien Activités */}
            <Link
              href="/activities"
              className="flex items-center gap-2 hover:text-blue-100 transition-colors"
            >
              <Activity className="w-5 h-5" />
              <span>Activités</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-6">
            {/* Notification Dropdown */}
            <NotificationList />

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-blue-400">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.firstname} {user.lastname}</p>
                  <p className="text-xs text-blue-200">{user.role}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-blue-700 rounded transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-blue-400">
            <Link
              href="/dashboard"
              className="block px-4 py-2 hover:bg-blue-700 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              href="/accounts"
              className="block px-4 py-2 hover:bg-blue-700 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Comptes
            </Link>

            <Link
              href="/notifications"
              className="block px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </Link>

            <Link
              href="/activities"
              className="block px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Activity className="w-5 h-5" />
              Activités
            </Link>

            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
