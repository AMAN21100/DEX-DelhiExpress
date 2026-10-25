import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

const passengerGrowthData = {
  '30D': [
    { month: 'Mar', passengers: 28.4 },
    { month: 'Apr', passengers: 31.2 },
    { month: 'May', passengers: 29.8 },
    { month: 'Jun', passengers: 33.6 },
    { month: 'Jul', passengers: 35.1 },
    { month: 'Aug', passengers: 37.4 },
    { month: 'Sep', passengers: 41.2 },
  ],
  '7D': [
    { month: 'Mon', passengers: 5.8 },
    { month: 'Tue', passengers: 6.1 },
    { month: 'Wed', passengers: 6.3 },
    { month: 'Thu', passengers: 6.0 },
    { month: 'Fri', passengers: 6.8 },
    { month: 'Sat', passengers: 5.2 },
    { month: 'Sun', passengers: 5.0 },
  ],
  '90D': [
    { month: 'Jan', passengers: 24.1 },
    { month: 'Feb', passengers: 26.5 },
    { month: 'Mar', passengers: 28.4 },
    { month: 'Apr', passengers: 31.2 },
    { month: 'May', passengers: 29.8 },
    { month: 'Jun', passengers: 33.6 },
    { month: 'Jul', passengers: 35.1 },
    { month: 'Aug', passengers: 37.4 },
    { month: 'Sep', passengers: 41.2 },
  ],
}

const revenueData = {
  '30D': [
    { month: 'Mar', revenue: 8.4 },
    { month: 'Apr', revenue: 9.2 },
    { month: 'May', revenue: 8.8 },
    { month: 'Jun', revenue: 10.1 },
    { month: 'Jul', revenue: 10.8 },
    { month: 'Aug', revenue: 11.6 },
    { month: 'Sep', revenue: 13.2 },
  ],
  '7D': [
    { month: 'Mon', revenue: 1.8 },
    { month: 'Tue', revenue: 1.9 },
    { month: 'Wed', revenue: 2.1 },
    { month: 'Thu', revenue: 1.9 },
    { month: 'Fri', revenue: 2.3 },
    { month: 'Sat', revenue: 1.7 },
    { month: 'Sun', revenue: 1.5 },
  ],
  '90D': [
    { month: 'Jan', revenue: 7.2 },
    { month: 'Feb', revenue: 7.9 },
    { month: 'Mar', revenue: 8.4 },
    { month: 'Apr', revenue: 9.2 },
    { month: 'May', revenue: 8.8 },
    { month: 'Jun', revenue: 10.1 },
    { month: 'Jul', revenue: 10.8 },
    { month: 'Aug', revenue: 11.6 },
    { month: 'Sep', revenue: 13.2 },
  ],
}

const peakHours = [
  { hour: '5AM', pax: 1200 },
  { hour: '6AM', pax: 3400 },
  { hour: '7AM', pax: 7800 },
  { hour: '8AM', pax: 11200 },
  { hour: '9AM', pax: 9400 },
  { hour: '10AM', pax: 5600 },
  { hour: '11AM', pax: 5100 },
  { hour: '12PM', pax: 6200 },
  { hour: '1PM', pax: 7100 },
  { hour: '2PM', pax: 6400 },
  { hour: '3PM', pax: 5800 },
  { hour: '4PM', pax: 7200 },
  { hour: '5PM', pax: 11400 },
  { hour: '6PM', pax: 10800 },
  { hour: '7PM', pax: 8200 },
  { hour: '8PM', pax: 5600 },
  { hour: '9PM', pax: 3200 },
  { hour: '10PM', pax: 1800 },
]

const routeUtil = [
  { name: '764', value: 87, color: '#2D89EF' },
  { name: '302', value: 61, color: '#00C897' },
  { name: '411', value: 78, color: '#8B5CF6' },
  { name: '118', value: 44, color: '#F59E0B' },
  { name: '550', value: 38, color: '#EF4444' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0a1628] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
      <p className="text-zinc-400 text-[11px] mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.name}
          className="text-xs font-bold font-mono my-0.5"
          style={{ color: p.color || '#2D89EF' }}
        >
          {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D')

  const handleExport = (fmt: string) => {
    if (fmt === 'PDF') {
      window.print()
      return
    }

    const rows = [
      ['Metric', 'Current Period', 'Trend'],
      ['Monthly Passengers', timeRange === '7D' ? '41.2M' : '41.2M', '+10.2%'],
      ['Ticket Revenue', timeRange === '7D' ? '₹13.2Cr' : '₹13.2Cr', '+13.8%'],
      ['Avg Occupancy', '64.3%', '+2.1%'],
      ['On-Time Rate', '87.4%', '+4.2%'],
      [],
      ['Route', 'Utilization %'],
      ...routeUtil.map(r => [`Route ${r.name}`, `${r.value}%`]),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `EquiTransit_Analytics_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const kpis = [
    { label: 'Monthly Passengers', val: timeRange === '7D' ? '9.6M' : timeRange === '90D' ? '122.4M' : '41.2M', trend: '+10.2%', color: '#2D89EF' },
    { label: 'Ticket Revenue', val: timeRange === '7D' ? '₹3.1Cr' : timeRange === '90D' ? '₹39.1Cr' : '₹13.2Cr', trend: '+13.8%', color: '#00C897' },
    { label: 'Avg Occupancy', val: '64.3%', trend: '+2.1%', color: '#8B5CF6' },
    { label: 'On-Time Rate', val: '87.4%', trend: '+4.2%', color: '#F59E0B' },
  ]

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Passenger growth · Revenue streams · Fleet utilization · Peak load curves
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Filter */}
          <div className="flex bg-white/4 border border-white/10 rounded-xl p-1">
            {(['7D', '30D', '90D'] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  timeRange === range
                    ? 'bg-[#2D89EF]/20 text-[#2D89EF] border border-[#2D89EF]/40 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1.5">
            {['PDF', 'Excel', 'CSV'].map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => handleExport(fmt)}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                ↓ {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(k => (
          <div
            key={k.label}
            className="bg-white/4 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition"
            style={{ borderColor: `${k.color}30` }}
          >
            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-wider truncate mb-1">
              {k.label}
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight" style={{ color: k.color }}>
              {k.val}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1 font-mono">
              <span>↑</span>
              <span>{k.trend} vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Graphs: Passenger Growth & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Passenger Growth */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Passenger Growth (millions)</h3>
            <span className="text-[10px] font-mono text-[#2D89EF] font-bold uppercase">Volume Curve</span>
          </div>
          <div className="w-full h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={passengerGrowthData[timeRange]} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="pax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D89EF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2D89EF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="passengers" stroke="#2D89EF" strokeWidth={2.5} fill="url(#pax)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Ticket Revenue (₹ Crore)</h3>
            <span className="text-[10px] font-mono text-[#00C897] font-bold uppercase">Fiscal Inflow</span>
          </div>
          <div className="w-full h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData[timeRange]} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C897" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00C897" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#00C897" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Passenger Volume by Hour (Peak Hours) */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Daily Passenger Volume by Hour</h3>
          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#EF4444]" /> &gt;9k Congested</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#F59E0B]" /> 6k–9k Moderate</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#2D89EF]" /> &lt;6k Normal</span>
          </div>
        </div>
        <div className="w-full h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHours} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pax" radius={[4, 4, 0, 0]}>
                {peakHours.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pax > 9000 ? '#EF4444' : entry.pax > 6000 ? '#F59E0B' : '#2D89EF'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route Utilization */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-white mb-4">Route Utilization</h3>
        <div className="space-y-3">
          {routeUtil.map(r => (
            <div
              key={r.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition"
            >
              <div
                className="size-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0"
                style={{ backgroundColor: `${r.color}15`, color: r.color }}
              >
                {r.name}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">Route {r.name} Arterial</span>
                  <span className="font-bold font-mono" style={{ color: r.color }}>{r.value}%</span>
                </div>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.value}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}