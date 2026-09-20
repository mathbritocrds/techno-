/** @jsxRuntime automatic */
import { Routes, Route } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Toaster } from './lib/shadcn/sonner'
import { ModalsProvider } from './context/ModalsContext'
import { AccessProvider, useAccess } from './context/AccessContext'
import { Layout } from './components/Layout'
import { EmployeeShell } from './components/EmployeeShell'
import Dashboard from './pages/Dashboard'
import Collaborators from './pages/Collaborators'
import Attendance from './pages/Attendance'
import Roles from './pages/Roles'
import Payroll from './pages/Payroll'
import Integration from './pages/Integration'
import CostAnalysis from './pages/CostAnalysis'
import NoAccess from './pages/NoAccess'

function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center">
      <LoaderCircle className="w-6 h-6 text-emerald-400 animate-spin" />
    </div>
  )
}

function AdminApp() {
  return (
    <ModalsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="colaboradores" element={<Collaborators />} />
          <Route path="frequencia" element={<Attendance />} />
          <Route path="cargos" element={<Roles />} />
          <Route path="folha" element={<Payroll />} />
          <Route path="integracao" element={<Integration />} />
          <Route path="analise-custos" element={<CostAnalysis />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </ModalsProvider>
  )
}

function AccessGate() {
  const { loading, isAdmin, employee } = useAccess()

  if (loading) return <LoadingScreen />
  if (isAdmin) return <AdminApp />
  if (employee) return <EmployeeShell />
  return <NoAccess />
}

export default function App() {
  return (
    <AccessProvider>
      <AccessGate />
      <Toaster theme="dark" />
    </AccessProvider>
  )
}
