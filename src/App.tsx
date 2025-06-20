import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import Layout from './components/Layout'
import ClientDashboard from './components/dashboards/ClientDashboard'
import SalesAssociateDashboard from './components/dashboards/SalesAssociateDashboard'
import TeamMemberDashboard from './components/dashboards/TeamMemberDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import ServiceRequestForm from './components/ServiceRequestForm'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" />
  }

  if (!profile.approved && profile.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600">
            Your {profile.role.replace('_', ' ')} account is pending admin approval. 
            Please wait for an administrator to approve your registration.
          </p>
        </div>
      </div>
    )
  }

  return <Layout>{children}</Layout>
}

function DashboardRouter() {
  const { profile } = useAuth()

  switch (profile?.role) {
    case 'client':
      return <ClientDashboard />
    case 'sales_associate':
      return <SalesAssociateDashboard />
    case 'team_member':
      return <TeamMemberDashboard />
    case 'administrator':
      return <AdminDashboard />
    default:
      return <div>Invalid role</div>
  }
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      } />
      <Route path="/request" element={
        <ProtectedRoute>
          <ServiceRequestForm />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
// Forzar nuevo deploy

export default App