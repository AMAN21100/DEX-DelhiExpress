import { useState, useEffect } from 'react'

export type LogType = 'all' | 'ticket' | 'bus' | 'ai' | 'driver'

export interface LogEntry {
  id: string
  type: 'ticket' | 'bus' | 'ai' | 'driver'
  icon: string
  time: string
  message: string
  status: 'success' | 'warning' | 'error' | 'info'
}

const initialLogs: LogEntry[] = [
  { id: 'LOG-9821', type: 'ai', icon: '🧠', time: '14:31:42', message: 'AI Fleet Allocation Rec #23 — Route 764 +6 buses approved by Operations Director', status: 'success' },
  { id: 'LOG-9820', type: 'ticket', icon: '🎫', time: '14:29:18', message: 'Ticket ET-88219 booked — Route 302, Kashmere Gate → Dilshad Garden, ₹25.00', status: 'success' },
  { id: 'LOG-9819', type: 'bus', icon: '🚌', time: '14:28:05', message: 'Bus DL-1-BP-411-C — Speed drop detected: 45 km/h → 18 km/h. Traffic congestion near Nehru Place', status: 'warning' },
  { id: 'LOG-9818', type: 'driver', icon: '👨‍✈️', time: '14:25:33', message: 'Driver DRV-006 (Manoj Tiwari) shift ended — Handover to DRV-014 completed for Route 302-G', status: 'success' },
  { id: 'LOG-9817', type: 'ai', icon: '🧠', time: '14:22:10', message: 'Demand Forecast Updated — Route 764 peak demand predicted 11,400 passengers at 5 PM', status: 'info' },
  { id: 'LOG-9816', type: 'bus', icon: '🚌', time: '14:20:55', message: 'Bus DL-1-BP-550-G entered maintenance mode — Scheduled service Dwarka Depot Block A', status: 'info' },
  { id: 'LOG-9815', type: 'ticket', icon: '🎫', time: '14:19:02', message: 'Ticket ET-88218 cancelled — Refund ₹30.00 initiated to UPI account', status: 'warning' },
  { id: 'LOG-9814', type: 'ai', icon: '🧠', time: '14:17:44', message: 'ETA Prediction accuracy update — Route 411: 76.2% (below threshold). Retraining triggered.', status: 'error' },
  { id: 'LOG-9813', type: 'driver', icon: '👨‍✈️', time: '14:15:28', message: 'Driver DRV-007 (Pradeep Gupta) marked absent — Auto-replacement DRV-021 assigned to Route 764', status: 'warning' },
  { id: 'LOG-9812', type: 'bus', icon: '🚌', time: '14:12:11', message: 'Bus DL-1-BP-764-A — ETA recalculated: 4 min (was 6 min). Route optimized.', status: 'success' },
  { id: 'LOG-9811', type: 'ticket', icon: '🎫', time: '14:10:00', message: '847 tickets issued in last 5 minutes — Route 764, 302, 411', status: 'info' },
  { id: 'LOG-9810', type: 'ai', icon: '🧠', time: '14:08:33', message: 'AI Shelter Monitoring — SH-002 (Kashmere Gate) crowd level 94%. Emergency alert triggered.', status: 'error' },
]

const statusColor: Record<string, string> = { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#2D89EF' }
const typeColor: Record<string, string> = { ticket: '#00C897', bus: '#2D89EF', ai: '#8B5CF6', driver: '#F59E0B' }

export default function SystemLogs() {
  const [logList, setLogList] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('system_logs')
      return saved ? JSON.parse(saved) : initialLogs
    } catch {
      return initialLogs
    }
  })

  const [filter, setFilter] = useState<LogType>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem('system_logs', JSON.stringify(logList))
  }, [logList])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]
      const randomId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`
      const simulatedEntries: LogEntry[] = [
        { id: randomId, type: 'bus', icon: '🚌', time: timeStr, message: 'Telemetry heartbeat verified — 2,184 onboard vehicle IoT beacons responding nominal', status: 'info' },
        { id: randomId, type: 'ticket', icon: '🎫', time: timeStr, message: 'Automated QR validator pass — Dwarka Sector 21 Smart Shelter terminal', status: 'success' },
        { id: randomId, type: 'ai', icon: '🧠', time: timeStr, message: 'Continuous ETA recalibration complete for Outer Ring Road feeder routes', status: 'success' },
      ]
      const chosen = simulatedEntries[Math.floor(Math.random() * simulatedEntries.length)]
      setLogList(prev => [chosen, ...prev.slice(0, 49)])
    }, 45000)

    return () => clearInterval(interval)
  }, [])

  const handleExportLogs = () => {
    const rows = [
      ['Log ID', 'Time', 'Type', 'Status', 'Message'],
      ...filtered.map(l => [l.id, l.time, l.type, l.status, `"${l.message.replace(/"/g, '""')}"`]),
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `EquiTransit_System_Logs_${filter}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = logList.filter(l =>
    (filter === 'all' || l.type === filter) &&
    (search === '' || l.message.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Logs</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Ticket logs · Bus events · AI decisions · Driver assignments · Real-time event pipe
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-bold text-[#10B981]">LIVE FEED</span>
          </div>
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer active:scale-95"
          >
            ↓ Export Logs
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search logs by keyword or ID…"
          className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-white/10 bg-white/4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 sm:pb-0">
          {(['all', 'ticket', 'bus', 'ai', 'driver'] as LogType[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                filter === f
                  ? 'border font-bold'
                  : 'bg-white/3 border border-white/8 text-zinc-400 hover:text-white'
              }`}
              style={
                filter === f
                  ? {
                      borderColor: typeColor[f] || '#2D89EF',
                      backgroundColor: `${typeColor[f] || '#2D89EF'}15`,
                      color: typeColor[f] || '#2D89EF',
                    }
                  : undefined
              }
            >
              {f === 'all' ? 'All' : f === 'ticket' ? '🎫 Tickets' : f === 'bus' ? '🚌 Bus' : f === 'ai' ? '🧠 AI' : '👨‍✈️ Drivers'}
            </button>
          ))}
        </div>
      </div>

      {/* System Logs Feed */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
        {/* Desktop Table Header */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-white/6 bg-white/2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <span className="w-20 font-mono">LOG ID</span>
          <span className="w-18 font-mono">TIME</span>
          <span className="flex-1">EVENT & TELEMETRY MESSAGE</span>
          <span className="w-16 text-right">STATUS</span>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-[580px] overflow-y-auto divide-y divide-white/4">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No system logs found matching criteria.
            </div>
          ) : (
            filtered.map((log, i) => (
              <div
                key={`${log.id}-${i}`}
                className="p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 hover:bg-white/2 transition"
              >
                {/* Mobile Top Row: Dot, Log ID, Time & Badges */}
                <div className="flex items-center justify-between sm:justify-start gap-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: statusColor[log.status] }}
                    />
                    <span className="font-mono text-[11px] text-zinc-400 font-semibold w-18 sm:w-20">
                      {log.id}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500 w-16 sm:w-18">
                      {log.time}
                    </span>
                  </div>

                  {/* Badges shown on right for mobile */}
                  <div className="sm:hidden flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider flex items-center gap-1"
                      style={{
                        backgroundColor: `${typeColor[log.type]}15`,
                        color: typeColor[log.type],
                        borderColor: `${typeColor[log.type]}30`,
                      }}
                    >
                      <span>{log.icon}</span>
                      <span>{log.type}</span>
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${statusColor[log.status]}15`,
                        color: statusColor[log.status],
                        borderColor: `${statusColor[log.status]}30`,
                      }}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>

                {/* Event Message */}
                <div className="flex-1 min-w-0 flex items-start gap-2.5">
                  <span
                    className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider items-center gap-1 shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${typeColor[log.type]}15`,
                      color: typeColor[log.type],
                      borderColor: `${typeColor[log.type]}30`,
                    }}
                  >
                    <span>{log.icon}</span>
                    <span>{log.type}</span>
                  </span>
                  <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed m-0 flex-1 break-words">
                    {log.message}
                  </p>
                </div>

                {/* Desktop Status Badge */}
                <span
                  className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider shrink-0 mt-0.5 text-center w-16"
                  style={{
                    backgroundColor: `${statusColor[log.status]}15`,
                    color: statusColor[log.status],
                    borderColor: `${statusColor[log.status]}30`,
                  }}
                >
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}