import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import SubjectsPage from './pages/SubjectsPage'
import GradesPage from './pages/GradesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import SchedulePage from './pages/SchedulePage'
import NotificationsPage from './pages/NotificationsPage'
import GroupsPage from './pages/GroupsPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute><Layout><UsersPage /></Layout></PrivateRoute>
      } />
      <Route path="/subjects" element={
        <PrivateRoute><Layout><SubjectsPage /></Layout></PrivateRoute>
      } />
      <Route path="/grades" element={
        <PrivateRoute><Layout><GradesPage /></Layout></PrivateRoute>
      } />
      <Route path="/assignments" element={
        <PrivateRoute><Layout><AssignmentsPage /></Layout></PrivateRoute>
      } />
      <Route path="/schedule" element={
        <PrivateRoute><Layout><SchedulePage /></Layout></PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>
      } />
      <Route path="/groups" element={
        <PrivateRoute><Layout><GroupsPage /></Layout></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}