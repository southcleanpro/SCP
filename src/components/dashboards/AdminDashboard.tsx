import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, ClipboardList, TrendingUp, CheckSquare, DollarSign, AlertCircle } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  pendingUsers: number
  totalRequests: number
  pendingRequests: number
  totalLeads: number
  totalTasks: number
  completedTasks: number
  totalCommissions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalLeads: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalCommissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users stats
      const { data: users } = await supabase.from('profiles').select('*')
      
      // Fetch service requests stats
      const { data: requests } = await supabase.from('service_requests').select('*')
      
      // Fetch leads stats
      const { data: leads } = await supabase.from('leads').select('*')
      
      // Fetch tasks stats
      const { data: tasks } = await supabase.from('tasks').select('*')

      const totalCommissions = leads?.reduce((acc, lead) => {
        if (lead.status === 'commission_paid' && lead.commission_amount) {
          return acc + lead.commission_amount
        }
        return acc
      }, 0) || 0

      setStats({
        totalUsers: users?.length || 0,
        pendingUsers: users?.filter(u => !u.approved && u.role !== 'client').length || 0,
        totalRequests: requests?.length || 0,
        pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
        totalLeads: leads?.length || 0,
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        totalCommissions
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingUsers,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Service Requests',
      value: stats.totalRequests,
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Commissions',
      value: `$${stats.totalCommissions}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of SouthClean Pro operations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/admin/users"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-600">Approve new registrations</p>
                  </div>
                </a>

                <a
                  href="/admin/requests"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <ClipboardList className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Service Requests</h3>
                    <p className="text-sm text-gray-600">Review and assign requests</p>
                  </div>
                </a>

                <a
                  href="/admin/leads"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Sales Leads</h3>
                    <p className="text-sm text-gray-600">Track and manage leads</p>
                  </div>
                </a>

                <a
                  href="/admin/tasks"
                  className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <CheckSquare className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Task Management</h3>
                    <p className="text-sm text-gray-600">Assign and track tasks</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}