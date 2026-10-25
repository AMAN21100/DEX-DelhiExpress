import { useState, useEffect } from 'react'
import type { AppPage } from '../../App'
import type { User } from '../data/mockDb'
import PassengerDashboard from './PassengerDashboard'
import JourneyPlanner from './JourneyPlanner'
import TicketBooking from './TicketBooking'
import MyTickets from './MyTickets'
import LiveTracking from './LiveTracking'
import PassengerNotifications from './PassengerNotifications'
import PassengerProfile from './PassengerProfile'
import DexSaathiChat from '../../components/DexSaathiChat'

interface Props {
  onNavigate: (page: AppPage) => void
}

export type PassengerTab = 'dashboard' | 'plan' | 'ticket' | 'mytickets' | 'tracking' | 'notifications' | 'profile'

const navItems: { id: PassengerTab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'plan', icon: '🗺️', label: 'Plan Journey' },
  { id: 'ticket', icon: '🎫', label: 'Buy Ticket' },
  { id: 'mytickets', icon: '📋', label: 'My Tickets' },
  { id: 'tracking', icon: '📍', label: 'Live Tracking' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'profile', icon: '👤', label: 'Profile' },
]

export default function PassengerLayout({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<PassengerTab>('dashboard')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(3)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 1. Read logged-in user and notifications
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }

      const storedNotifs = localStorage.getItem('passenger_notifications')
      if (storedNotifs) {
        const parsed = JSON.parse(storedNotifs)
        const unread = parsed.filter((n: any) => !n.read).length
        setUnreadCount(unread)
      }
    } catch (e) {
      console.error('Failed to load passenger user context', e)
    }
  }, [activeTab])

  // Helper for dynamic initials
  const getInitials = (name?: string) => {
    if (!name) return 'PS'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Handle clean sign out
  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('pending_ticket_booking')
    onNavigate('landing')
  }

  const handleTabSelect = (tab: PassengerTab) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeLabel = navItems.find(item => item.id === activeTab)?.label || 'Dashboard'

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <PassengerDashboard onTabChange={(tab: any) => setActiveTab(tab)} />
      case 'plan': return <JourneyPlanner onTabChange={(tab: any) => setActiveTab(tab)} />
      case 'ticket': return <TicketBooking onTabChange={(tab: any) => setActiveTab(tab === 'tickets' ? 'mytickets' : tab)} />
      case 'mytickets': return <MyTickets />
      case 'tracking': return <LiveTracking />
      case 'notifications': return <PassengerNotifications />
      case 'profile': return <PassengerProfile />
      default: return <PassengerDashboard onTabChange={(tab: any) => setActiveTab(tab)} />
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans flex flex-col lg:flex-row">
      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-95 transition"
            aria-label="Toggle passenger menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#2D89EF] to-[#00C897] text-white text-xs">
              🚌
            </span>
            <div className="leading-tight">
              <span className="block text-xs font-bold text-slate-900 tracking-tight">DEX Commute</span>
              <span className="block text-[9px] text-[#2D89EF] font-semibold">{activeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => handleTabSelect('notifications')}
              className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              title={`${unreadCount} unread notifications`}
            >
              <span className="text-sm">🔔</span>
              <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabSelect('profile')}
            className="size-7 rounded-full bg-gradient-to-br from-[#2D89EF] to-[#1a6fd4] flex items-center justify-center text-[10px] font-bold text-white shadow-xs cursor-pointer active:scale-95"
          >
            {getInitials(currentUser?.name)}
          </button>
        </div>
      </header>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-Out Drawer on Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-xs lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-lg text-white shadow-xs shrink-0">
              🚌
            </div>
            <div>
              <div className="font-extrabold text-[14px] text-slate-900 tracking-tight">DEX-DelhiExpress</div>
              <div className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">PASSENGER PORTAL</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dynamic User Profile Card */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#2D89EF] to-[#1a6fd4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.name || 'Priya Sharma'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser?.id ? `ET-${currentUser.id.slice(-4).toUpperCase()}-DL` : 'ET-2847-DL'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-[13px] transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#2D89EF]/10 text-[#2D89EF] font-bold border-l-3 border-[#2D89EF]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-3 border-transparent'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="truncate flex-1">{item.label}</span>
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1.5">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
          >
            <span>🏠</span>
            <span>Landing Page</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer font-medium"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:ml-[240px] min-h-[calc(100vh-56px)] lg:min-h-screen overflow-x-hidden p-3.5 sm:p-6 lg:p-8">
        {renderPage()}
      </main>

      {/* Floating DEX Saathi AI Chatbot */}
      <DexSaathiChat />
    </div>
  )
}