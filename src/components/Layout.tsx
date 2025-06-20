import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  LogOut, 
  Home, 
  ClipboardList, 
  Users, 
  Settings,
  Star,
  TrendingUp,
  CheckSquare
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()

  const getNavItems = () => {
    switch (profile?.role) {
      case 'client':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: ClipboardList, label: 'New Request', href: '/request' },
          { icon: Star, label: 'My Requests', href: '/my-requests' },
        ]
      case 'sales_associate':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: TrendingUp, label: 'New Lead', href: '/new-lead' },
          { icon: Users, label: 'My Leads', href: '/my-leads' },
        ]
      case 'team_member':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: CheckSquare, label: 'My Tasks', href: '/my-tasks' },
        ]
      case 'administrator':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: ClipboardList, label: 'Requests', href: '/admin/requests' },
          { icon: TrendingUp, label: 'Leads', href: '/admin/leads' },
          { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks' },
          { icon: Users, label: 'Users', href: '/admin/users' },
          { icon: Settings, label: 'Settings', href: '/admin/settings' },
        ]
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">SouthClean Pro</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {getNavItems().map(({ icon: Icon, label, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </a>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role?.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}