import { useState, useEffect } from 'react'

export interface NotificationItem {
  id: number
  type: 'delay' | 'ai' | 'alert' | 'success' | 'info' | 'emergency'
  icon: string
  title: string
  body: string
  time: string
  color: string
  read: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'delay',
    icon: '⏱️',
    title: 'Route 764 Delayed',
    body: 'Bus DL-1-BP-764-A is running 8 minutes late due to traffic congestion near Dhaula Kuan flyover.',
    time: '2 min ago',
    color: '#F59E0B',
    read: false,
  },
  {
    id: 2,
    type: 'ai',
    icon: '🧠',
    title: 'AI Route Recommendation',
    body: 'High crowd expected on Route 764 from 5 PM to 8 PM today. Consider Route 302 via Kashmere Gate for a comfortable journey.',
    time: '15 min ago',
    color: '#8B5CF6',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    icon: '🔴',
    title: 'Service Change — Route 411',
    body: 'Route 411 will not serve Nehru Place stop from 10 AM to 2 PM due to road maintenance. Boarding from Govindpuri instead.',
    time: '1 hour ago',
    color: '#EF4444',
    read: false,
  },
  {
    id: 4,
    type: 'success',
    icon: '✅',
    title: 'Ticket Confirmed',
    body: 'Your ticket ET-88214 for Route 764 (Dwarka Sec-21 → Connaught Place) is active and confirmed for boarding.',
    time: '3 hours ago',
    color: '#10B981',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    icon: '📢',
    title: 'New Low-Floor AC Buses on Route 302',
    body: 'EquiTransit has deployed 4 new air-conditioned low-floor buses on Route 302 for enhanced comfort.',
    time: 'Yesterday',
    color: '#2D89EF',
    read: true,
  },
  {
    id: 6,
    type: 'emergency',
    icon: '🚨',
    title: 'Emergency: Avoid Connaught Place Area',
    body: 'Security advisory in effect near CP. Buses are being diverted via Rajpath. Expect delays of 15-20 minutes.',
    time: 'Yesterday',
    color: '#EF4444',
    read: true,
  },
]

export default function PassengerNotifications() {
  const [items, setItems] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('passenger_notifications')
      return saved ? JSON.parse(saved) : initialNotifications
    } catch {
      return initialNotifications
    }
  })

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('passenger_notifications', JSON.stringify(items))
  }, [items])

  const unreadCount = items.filter(n => !n.read).length

  const handleMarkAsRead = (id: number) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="w-full max-w-3xl space-y-5 sm:space-y-6 text-slate-800 font-sans">
      {/* Responsive Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated on delays, diversions, and AI recommendations
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-[#2D89EF] hover:underline cursor-pointer py-1 px-1.5 transition"
            >
              Mark all as read
            </button>
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold font-mono">
              {unreadCount} unread
            </span>
          </div>
        )}
      </div>

      {/* Notifications Timeline Feed */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {items.map((n, i) => (
          <div
            key={n.id}
            onClick={() => handleMarkAsRead(n.id)}
            className={`flex items-start gap-3.5 sm:gap-4 py-4 sm:py-5 first:pt-1 last:pb-1 transition cursor-pointer select-none active:bg-slate-50/80 rounded-xl px-1 sm:px-2 ${
              n.read ? 'opacity-65' : 'opacity-100'
            }`}
          >
            {/* Timeline Icon Node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="size-10 sm:size-11 rounded-2xl flex items-center justify-center text-base sm:text-lg border relative shadow-xs"
                style={{
                  backgroundColor: `${n.color}15`,
                  borderColor: `${n.color}35`,
                }}
              >
                {n.icon}
                {!n.read && (
                  <span
                    className="absolute -top-1 -right-1 size-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: n.color }}
                  />
                )}
              </div>
              {i < items.length - 1 && (
                <span className="w-0.5 flex-1 min-h-[24px] bg-slate-100 mt-2 rounded-full" />
              )}
            </div>

            {/* Notification Body & Header */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {n.title}
                </h3>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {n.time}
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed m-0">
                {n.body}
              </p>

              <div className="mt-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${n.color}12`,
                    borderColor: `${n.color}25`,
                    color: n.color,
                  }}
                >
                  {n.type === 'delay'
                    ? 'Delay Alert'
                    : n.type === 'ai'
                    ? 'AI Insight'
                    : n.type === 'alert'
                    ? 'Service Alert'
                    : n.type === 'success'
                    ? 'Confirmed'
                    : n.type === 'emergency'
                    ? 'Emergency'
                    : 'Info'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}