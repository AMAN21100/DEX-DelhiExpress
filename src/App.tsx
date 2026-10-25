import { useState } from 'react'
import { AuthProvider } from './pages/AuthContext'
import Landing from './pages/Landing'
import PassengerLayout from './pages/passenger/PassengerLayout'
import AdminLayout from './pages/admin/AdminLayout'
import LoginPage from './pages/LoginPage'
import DexCargo from './pages/cargo/DexCargo'
import CargoLoginPage from './pages/cargo/CargoLoginPage'

export type AppPage = 'landing' | 'login-passenger' | 'login-admin' | 'login-cargo' | 'passenger' | 'admin' | 'cargo'

function AppContent() {
  const [page, setPage] = useState<AppPage>('landing')

  switch (page) {
    case 'landing':
      return <Landing onNavigate={setPage} />
    case 'login-passenger':
      return <LoginPage role="passenger" onNavigate={setPage} />
    case 'login-admin':
      return <LoginPage role="admin" onNavigate={setPage} />
    case 'login-cargo':
      return <CargoLoginPage onNavigate={setPage} />
    case 'passenger':
      return <PassengerLayout onNavigate={setPage} />
    case 'admin':
      return <AdminLayout onNavigate={setPage} />
    case 'cargo':
      return <DexCargo onNavigate={setPage} />
    default:
      return <Landing onNavigate={setPage} />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
        <AppContent />
      </div>
    </AuthProvider>
  )
}