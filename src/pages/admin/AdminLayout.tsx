import { useState, useEffect } from 'react'
import type { AppPage } from '../../App'
import type { User } from '../data/mockDb'
import AdminDashboard from './AdminDashboard'
import FleetManagement from './FleetManagement'
import DriverManagement from './DriverManagement'
import RouteManagement from './RouteManagement'
import RouteDiversionManager from './RouteDiversionManager'
import AIControlCenter from './AIControlCenter'
import Analytics from './Analytics'
import SafetyCenter from './SafetyCenter'
import SmartShelters from './SmartShelters'
import SystemLogs from './SystemLogs'

interface Props {
  onNavigate: (page: AppPage) => void
}

export type AdminTab = 'dashboard' | 'fleet' | 'drivers' | 'routes' | 'diversion' | 'ai' | 'analytics' | 'safety' | 'shelters' | 'logs'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard' as AdminTab, icon: '🏠', label: 'Dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'fleet' as AdminTab, icon: '🚌', label: 'Fleet Management' },
      { id: 'drivers' as AdminTab, icon: '👨‍✈️', label: 'Driver Management' },
      { id: 'routes' as AdminTab, icon: '🛣️', label: 'Route Management' },
      { id: 'diversion' as AdminTab, icon: '⚡', label: 'Route Diversions' },
      { id: 'shelters' as AdminTab, icon: '🏠', label: 'Smart Shelters' },
    ],
  },
  {
    label: 'AI & Analytics',
    items: [
      { id: 'ai' as AdminTab, icon: '🧠', label: 'AI Control Center' },
      { id: 'analytics' as AdminTab, icon: '📊', label: 'Analytics & Reports' },
    ],
  },
  {
    label: 'Safety & Logs',
    items: [
      { id: 'safety' as AdminTab, icon: '🚨', label: 'Safety & Emergency' },
      { id: 'logs' as AdminTab, icon: '📋', label: 'System Logs' },
    ],
  },
]

export default function AdminLayout({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 1. Read current logged-in user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load user session', e)
    }
  }, [])

  // 2. Helper to compute initials for avatar (e.g. "Amit Kumar" -> "AK")
  const getInitials = (name?: string) => {
    if (!name) return 'AK'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // 3. Functional Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    onNavigate('landing')
  }

  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Lookup active tab label for mobile header display
  const activeLabel = navGroups
    .flatMap(g => g.items)
    .find(item => item.id === activeTab)?.label || 'Dashboard'

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard onTabChange={setActiveTab} />
      case 'fleet': return <FleetManagement />
      case 'drivers': return <DriverManagement />
      case 'routes': return <RouteManagement />
      case 'diversion': return <RouteDiversionManager />
      case 'ai': return <AIControlCenter />
      case 'analytics': return <Analytics />
      case 'safety': return <SafetyCenter />
      case 'shelters': return <SmartShelters />
      case 'logs': return <SystemLogs />
      default: return <AdminDashboard onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-[#060d1f] text-zinc-100 font-sans flex flex-col lg:flex-row">
      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a1628]/95 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#2D89EF] to-[#00C897] text-xs">
              🚌
            </span>
            <div className="leading-tight">
              <span className="block text-xs font-bold text-white tracking-tight">DEX Control</span>
              <span className="block text-[9px] text-[#2D89EF] font-semibold">{activeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Exit Portal
          </button>
          <div className="size-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6d3fd4] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            {getInitials(currentUser?.name)}
          </div>
        </div>
      </header>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Fixed + Mobile Off-Canvas Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[248px] bg-[#0a1628] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-lg shadow-md shrink-0">
              🚌
            </div>
            <div>
              <div className="font-extrabold text-[14px] text-white tracking-tight">DEX-DelhiExpress</div>
              <div className="text-[9px] text-zinc-400 font-semibold tracking-wider uppercase">AI CONTROL CENTER</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Admin Profile Box */}
        <div className="px-4 py-3.5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6d3fd4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.name || 'Amit Kumar'}
              </div>
              <div className="text-[10px] text-zinc-400">Operations Director</div>
            </div>
            <div
              className="size-2 rounded-full bg-[#10B981] ring-4 ring-emerald-500/20 shrink-0"
              title="System Online"
            />
          </div>
        </div>

        {/* Navigation Item Groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="text-[9px] font-bold text-zinc-400/80 tracking-widest uppercase px-2.5 mb-1.5">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#2D89EF]/15 text-[#2D89EF] font-semibold border-l-2 border-[#2D89EF]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <span className="truncate flex-1">{item.label}</span>
                      {item.id === 'diversion' && (
                        <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                      {item.id === 'safety' && (
                        <span className="bg-[#EF4444] text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                          2
                        </span>
                      )}
                      {item.id === 'ai' && (
                        <span className="bg-purple-500/20 text-[#8B5CF6] border border-purple-500/30 rounded px-1.5 py-0.5 text-[8px] font-bold">
                          LIVE
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom System Status & Sign Out */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="bg-[#10B981]/10 border border-[#10B981]/25 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] text-[#10B981] font-semibold tracking-wide">All Systems Operational</span>
          </div>
          
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Fluid margin on desktop, zero margin on mobile) */}
      <main className="flex-1 w-full lg:ml-[248px] min-h-[calc(100vh-56px)] lg:min-h-screen overflow-x-hidden p-3 sm:p-5 lg:p-7">
        {renderPage()}
      </main>
    </div>
  )
}