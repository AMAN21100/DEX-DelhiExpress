import { useMemo, useState } from 'react'
import type { AppPage } from '../../App'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Box,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Code2,
  Gauge,
  IndianRupee,
  LockKeyhole,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  QrCode,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

interface Props {
  onNavigate?: (page: AppPage) => void
}

const cn = (...classes: Array<string | false | undefined | null>) => classes.filter(Boolean).join(' ')

function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition duration-200 active:scale-[0.98]',
        variant === 'primary' && 'bg-orange-500 text-zinc-950 shadow-[0_0_25px_rgba(249,115,22,0.25)] hover:bg-orange-400',
        variant === 'ghost' && 'text-zinc-400 hover:bg-white/5 hover:text-white',
        variant === 'outline' && 'border border-white/10 bg-white/3 text-zinc-200 hover:border-orange-500/40 hover:text-orange-400',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="block w-full">
      <span className="mb-1.5 block text-[10px] sm:text-[11px] font-bold uppercase tracking-[.14em] text-zinc-400">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-zinc-900 py-3 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-zinc-100 outline-none transition focus:border-orange-500/60"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-zinc-500" />
      </span>
    </label>
  )
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-6 sm:mb-8 max-w-2xl">
      <div className="mb-2.5 flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[.18em] text-orange-400">
        <span className="h-px w-5 sm:w-6 bg-orange-500" />
        {eyebrow}
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">{title}</div>
      <p className="mt-2.5 text-xs sm:text-sm md:text-base leading-relaxed text-zinc-400">{copy}</p>
    </div>
  )
}

const timeline = [
  'Staged at Terminal',
  'Loaded at Bay',
  'En Route · WPE/Ring Corridor',
  'Inbound Checkpoint',
  'Dock Discharged',
]

type TabId = 'overview' | 'book' | 'radar' | 'lockers' | 'corridors' | 'analytics' | 'developers'
const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'book', label: 'Book Freight' },
  { id: 'radar', label: 'Cargo Radar' },
  { id: 'lockers', label: 'PUDO Lockers' },
  { id: 'corridors', label: 'Corridors' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'developers', label: 'Developers' },
]

export default function DexCargo({ onNavigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const hash = window.location.hash.slice(1) as TabId
    return tabs.some(tab => tab.id === hash) ? hash : 'overview'
  })

  const [role] = useState<string>(() => {
    return localStorage.getItem('dex_cargo_active_role') || 'Fleet Operator / DTC Admin'
  })

  const [toast, setToast] = useState('')
  const [comparison, setComparison] = useState<'tempo' | 'bus'>('bus')
  const [origin, setOrigin] = useState('Sanjay Gandhi Transport Nagar')
  const [destination, setDestination] = useState('Gurugram Logistics Park')
  const [type, setType] = useState('Heavy Multi-Axle (16T+)')
  const [weight, setWeight] = useState(16)
  const [slot, setSlot] = useState<'midday' | 'night'>('midday')
  const [waybill, setWaybill] = useState('DEX-TRK-9241')
  const [tracking, setTracking] = useState('DEX-TRK-9241')
  const [searched, setSearched] = useState(false)
  const [otp, setOtp] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  const price = Math.max(1, weight || 0) * 1850
  const eta = slot === 'midday' ? '2h 20m' : '4h 10m'
  const qrPattern = useMemo(() => Array.from({ length: 81 }, (_, i) => ((i * 7 + waybill.charCodeAt(i % waybill.length)) % 5 < 2)), [waybill])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const navigate = (tab: TabId) => {
    setActiveTab(tab)
    setMenuOpen(false)
    window.history.replaceState(null, '', `#${tab}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const generateWaybill = () => {
    setWaybill(`DEX-TRK-${Math.floor(1000 + Math.random() * 9000)}`)
    notify('Cryptographic waybill rotated and manifest ready')
  }

  const enterOtp = (digit: string) => {
    if (unlocked) return
    const next = (otp + digit).slice(0, 6)
    setOtp(next)
    if (next.length === 6) setTimeout(() => {
      setUnlocked(true)
      notify('Bay A07 unlocked · clearance receipt issued')
    }, 250)
  }

  const resetDock = () => {
    setOtp('')
    setUnlocked(false)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500 selection:text-zinc-950">
      {/* Responsive SCADA Ticker */}
      <div className="border-b border-orange-500/20 bg-orange-500 py-1.5 text-zinc-950 px-3 sm:px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between sm:justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[.12em]">
          <div className="flex items-center gap-1.5">
            <Activity className="size-3.5 shrink-0" />
            <span>Active Fleet: 420</span>
          </div>
          <span className="opacity-40">|</span>
          <span>Load: 73%</span>
          <span className="hidden md:inline opacity-40">|</span>
          <span className="hidden md:inline">Tempos Displaced: 1,850</span>
          <span className="hidden lg:inline opacity-40">|</span>
          <span className="hidden lg:inline">Pink Pass Fund: ₹28.4L</span>
        </div>
      </div>

      {/* Responsive Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/7 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Logo */}
          <button type="button" onClick={() => navigate('overview')} className="flex items-center gap-2.5 text-left cursor-pointer">
            <span className="relative grid size-8 rotate-45 place-items-center rounded-lg border border-orange-300 bg-orange-500 text-zinc-950 shadow-[0_0_16px_rgba(249,115,22,0.3)] shrink-0">
              <Route className="size-4 -rotate-45" />
              <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
            </span>
            <span className="text-base font-black tracking-tight whitespace-nowrap">
              DEX <span className="text-orange-500">Cargo</span>
            </span>
          </button>
          
          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-0.5 xl:flex">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                type="button"
                onClick={() => navigate(tab.id)} 
                className={cn('rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer', activeTab === tab.id ? 'bg-orange-500/10 text-orange-400' : 'text-zinc-400 hover:text-white')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
              <span className="size-1 animate-pulse rounded-full bg-emerald-400" /> ONLINE
            </span>
            
            {/* Locked Role Badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/90 px-2 sm:px-2.5 py-1 text-xs font-semibold text-zinc-200 select-none">
              <UserRound className="size-3 text-orange-400 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-300 max-w-[110px] sm:max-w-none truncate">{role}</span>
            </div>

            {/* Back Button */}
            {onNavigate && (
              <button 
                type="button"
                className="px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                onClick={() => onNavigate('landing')}
              >
                ← Back
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="p-2 text-zinc-400 hover:text-white xl:hidden cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {menuOpen && (
          <div className="border-t border-white/5 bg-zinc-950/95 px-4 py-3 xl:hidden backdrop-blur-2xl">
            <div className="grid grid-cols-2 gap-1.5">
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  type="button"
                  onClick={() => navigate(tab.id)} 
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-left text-xs font-semibold cursor-pointer transition flex items-center justify-between',
                    activeTab === tab.id ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-zinc-300 hover:bg-white/5'
                  )}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <span className="size-1.5 rounded-full bg-orange-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed right-3 sm:right-6 top-20 z-[70] flex items-center gap-2 rounded-xl border border-orange-500/30 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-orange-300 shadow-[0_0_35px_rgba(249,115,22,0.25)]">
          <span className="size-2 animate-pulse rounded-full bg-orange-500 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      <section className={cn('relative border-b border-white/6', activeTab !== 'overview' && 'hidden')}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.12),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
        
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24 items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[.14em] text-orange-400">
              <Sparkles className="size-3.5" /> AI Freight Grid · Delhi NCR
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-[1.02] tracking-tight text-white">
              Consolidating Delhi’s Heavy Freight on <span className="text-orange-500">Smart Transit.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed text-zinc-400 max-w-xl">
              Intelligent load-matching and off-peak corridor scheduling for commercial carriers and electric transport fleets.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <Button type="button" onClick={() => navigate('book')}>Book freight <ArrowRight className="size-4" /></Button>
              <Button type="button" variant="outline" onClick={() => navigate('radar')}><Radar className="size-4" /> Open radar</Button>
            </div>
          </div>

          {/* Radar Visual */}
          <div className="relative flex items-center justify-center py-4">
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-sm md:max-w-md rounded-full border border-orange-500/10">
              <div className="absolute inset-[14%] rounded-full border border-orange-500/20" />
              <div className="absolute inset-[28%] rounded-full border border-orange-500/30" />
              <div className="absolute inset-[42%] grid place-items-center rounded-full border border-orange-500/50 bg-orange-500/10 shadow-[0_0_60px_rgba(249,115,22,0.2)]">
                <Truck className="size-8 sm:size-10 text-orange-400" />
              </div>
              {[
                { pos: 'top-[8%] left-[45%]', num: '502' },
                { pos: 'top-[52%] right-[2%]', num: '764' },
                { pos: 'bottom-[8%] left-[24%]', num: '419' },
                { pos: 'top-[34%] left-[4%]', num: '534' }
              ].map(item => (
                <div key={item.num} className={cn('absolute flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-zinc-950 px-2 py-1 text-[9px] font-bold text-orange-300 shadow-md', item.pos)}>
                  <span className="size-1 animate-pulse rounded-full bg-orange-400" /> FLT {item.num}
                </div>
              ))}
              <div className="absolute left-[20%] top-[20%] size-2 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316]" />
              <div className="absolute bottom-[24%] right-[18%] size-2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />
            </div>
          </div>
        </div>

        {/* 3 Overview KPI Counters */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 border-t border-white/6 sm:grid-cols-3">
          {[
            { stat: '45%', label: 'lower ton-km cost', Icon: IndianRupee },
            { stat: 'Zero', label: 'city-choke transit runs', Icon: Truck },
            { stat: '24', label: 'automated freight hubs', Icon: Box },
          ].map((item, i) => (
            <div key={item.label} className={cn('flex items-center gap-3.5 p-4 sm:p-6', i > 0 && 'border-t border-white/6 sm:border-l sm:border-t-0')}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400"><item.Icon className="size-5" /></span>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{item.stat}</div>
                <div className="text-[11px] sm:text-xs text-zinc-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OVERVIEW ARCHITECTURE */}
      <section className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'overview' && 'hidden')}>
        <SectionTitle eyebrow="Ecosystem architecture" title="One network. Four leverage points." copy="Compare fragmented tempo delivery with consolidated transit freight across Delhi’s arterial grid." />
        
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Comparison Tool */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6">
            <div className="mb-4 flex rounded-xl bg-zinc-950 p-1">
              {(['tempo', 'bus'] as const).map(mode => (
                <button 
                  key={mode} 
                  type="button" 
                  onClick={() => { setComparison(mode); notify(`${mode === 'bus' ? 'Cargo bus' : 'Tempo'} model selected`) }} 
                  className={cn('flex-1 rounded-lg py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition cursor-pointer', comparison === mode ? 'bg-orange-500 text-zinc-950 shadow-sm' : 'text-zinc-500')}
                >
                  {mode === 'bus' ? 'Cargo Bus Grid' : 'Urban Tempo'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Cost / shipment', value: comparison === 'bus' ? '₹84' : '₹238' },
                { label: 'Transit time', value: comparison === 'bus' ? '94 min' : '128 min' },
                { label: 'CO₂ / load', value: comparison === 'bus' ? '0.3 kg' : '4.8 kg' }
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-500">{stat.label}</div>
                  <div className="mt-1 font-mono text-base sm:text-lg font-bold text-cyan-400">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <Gauge className="size-4 text-orange-500 shrink-0" />
              <span>Real-time model using load factor, corridor speed, and energy intensity.</span>
            </div>
          </div>

          {/* Delhi Arterial Live Mesh Visual */}
          <div className="relative min-h-56 sm:min-h-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="absolute left-[8%] top-[18%] h-px w-[82%] rotate-12 bg-orange-500/40" />
            <div className="absolute left-[14%] top-[62%] h-px w-[76%] -rotate-12 bg-cyan-400/30" />
            <div className="absolute left-[48%] top-[5%] h-[88%] w-px rotate-12 bg-orange-500/30" />
            {[
              { pos: 'left-[10%] top-[22%]', label: 'Kashmere Gate' },
              { pos: 'right-[10%] top-[34%]', label: 'Anand Vihar' },
              { pos: 'left-[26%] bottom-[16%]', label: 'Okhla' },
              { pos: 'right-[18%] bottom-[12%]', label: 'Saket' }
            ].map((node, idx) => (
              <div key={node.label} className={cn('absolute', node.pos)}>
                <span className={cn('block size-2.5 rounded-full shadow-[0_0_15px_currentColor]', idx % 2 ? 'bg-cyan-400 text-cyan-400' : 'animate-pulse bg-orange-500 text-orange-500')} />
                <span className="mt-1.5 block whitespace-nowrap font-mono text-[9px] text-zinc-400">{node.label}</span>
              </div>
            ))}
            <div className="absolute bottom-3 left-4 text-[9px] font-bold uppercase tracking-[.18em] text-zinc-500">Delhi arterial live mesh</div>
          </div>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Modular Rear Bus Bays', copy: 'Sealed, sensor-rich cargo modules.' },
            { title: 'Off-Peak Capacity Windows', copy: 'Midday and night network slots.' },
            { title: 'Smart Shelter PUDO', copy: '12-bay contactless collection.' },
            { title: 'Social Equity Subsidy', copy: 'Revenue funds Pink Pass access.' }
          ].map((pillar, i) => (
            <div key={pillar.title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="font-mono text-xs text-orange-500">0{i+1}</div>
              <div className="mt-2 text-sm font-bold text-white">{pillar.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-zinc-400">{pillar.copy}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TAB 2: BOOK FREIGHT */}
      <section id="booking" className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'book' && 'hidden')}>
        <SectionTitle eyebrow="AI freight booking console" title="Fill the right truck on the right corridor." copy="AI-matched loads, axle-aware capacity, and off-peak routing across Delhi NCR’s freight terminals." />
        
        <div className="grid overflow-hidden rounded-2xl sm:rounded-3xl border border-white/8 bg-zinc-900/50 lg:grid-cols-[1fr_360px]">
          {/* Booking Inputs */}
          <div className="p-4 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Origin terminal" value={origin} onChange={setOrigin}>
                {['Sanjay Gandhi Transport Nagar', 'Okhla', 'Kundli'].map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select label="Destination hub" value={destination} onChange={setDestination}>
                {['Gurugram Logistics Park', 'Greater Noida ICD', 'Anand Vihar'].map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select label="Vehicle class" value={type} onChange={setType}>
                {['Heavy Multi-Axle (16T+)', 'Medium E-Truck (7T)', 'LCV Transport'].map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
              <label className="block">
                <span className="mb-1.5 block text-[10px] sm:text-[11px] font-bold uppercase tracking-[.14em] text-zinc-400">Load (tonnes)</span>
                <input 
                  type="number" 
                  min="1" 
                  value={weight} 
                  onChange={e => setWeight(Number(e.target.value))} 
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-3 text-xs sm:text-sm font-medium text-zinc-100 outline-none transition focus:border-orange-500/60" 
                />
              </label>
            </div>

            <div className="mt-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[.14em] text-zinc-400">Transit window</div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {[
                { value: 'midday', label: 'Inter-Hub Midday Transfer', time: '11:30 AM – 3:30 PM', Icon: Zap },
                { value: 'night', label: 'Night Freight Corridor', time: '11:00 PM – 6:00 AM', Icon: Clock3 },
              ].map(w => (
                <button 
                  key={w.value} 
                  type="button" 
                  onClick={() => setSlot(w.value as 'midday' | 'night')} 
                  className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition', slot === w.value ? 'border-orange-500/60 bg-orange-500/10' : 'border-white/10 bg-zinc-950/40 hover:border-white/20')}
                >
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', slot === w.value ? 'bg-orange-500 text-zinc-950' : 'bg-white/5 text-zinc-500')}><w.Icon className="size-4" /></span>
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-white">{w.label}</span>
                    <span className="mt-0.5 block text-[11px] text-zinc-400">{w.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="border-t border-white/8 bg-zinc-950/60 p-5 sm:p-7 lg:border-l lg:border-t-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live quote</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">CAPACITY FOUND</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">₹{price}</span>
                <span className="text-xs text-zinc-500">incl. handling</span>
              </div>
              <div className="mt-4 space-y-2.5 border-y border-white/7 py-4 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">Rate</span><span className="font-semibold text-zinc-200">₹1,850 / ton</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Axle Fill</span><span className="font-semibold text-emerald-400">{Math.min(100, Math.round((weight / 18) * 100))}%</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Transit ETA</span><span className="font-semibold text-orange-400">{eta}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Corridor</span><span className="font-semibold text-zinc-200">WPE / Ring</span></div>
              </div>
            </div>

            <div>
              <Button type="button" className="mt-4 w-full" onClick={generateWaybill}>
                <QrCode className="size-4" /> Issue Digital e-Way Bill
              </Button>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/7 bg-white/3 p-2.5">
                <div className="grid grid-cols-9 gap-px rounded bg-white p-1 shrink-0">
                  {qrPattern.map((on, i) => <span key={`qr-${i}`} className={cn('size-0.5 sm:size-1', on ? 'bg-zinc-950' : 'bg-white')} />)}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-400 truncate">Consignment ID</div>
                  <div className="font-mono text-xs font-bold text-orange-400 truncate">{waybill}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAB 3: CARGO RADAR */}
      <section id="radar" className={cn('min-h-[70vh] border-y border-white/6 bg-zinc-900/25 px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'radar' && 'hidden')}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionTitle eyebrow="Live tracking radar" title="Every axle, seal and checkpoint accounted for." copy="Track commercial fleets across terminals, freight corridors, checkpoints, and automated docks." />
            <form onSubmit={e => { e.preventDefault(); setSearched(true); notify(`Telemetry linked to ${tracking}`) }} className="mb-6 flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
                <input 
                  value={tracking} 
                  onChange={e => setTracking(e.target.value)} 
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm outline-none focus:border-orange-500/50" 
                  placeholder="Tracking ID" 
                />
              </div>
              <Button type="submit">Track</Button>
            </form>
          </div>

          <div className={cn('grid gap-4 lg:grid-cols-[1.35fr_0.65fr]', searched && 'animate-[pulse_.4s_ease-out_1]')}>
            {/* Timeline */}
            <div className="rounded-2xl border border-white/8 bg-zinc-950/70 p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">TRACKING</div>
                  <div className="mt-0.5 font-mono text-sm sm:text-base font-bold text-white">{tracking || waybill}</div>
                </div>
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[9px] font-bold text-orange-400">IN TRANSIT</span>
              </div>
              
              <div className="space-y-0">
                {timeline.map((item, i) => {
                  const active = i <= 2
                  return (
                    <div key={item} className="relative flex min-h-14 gap-3.5">
                      {i < timeline.length - 1 && <span className={cn('absolute left-[11px] top-6 h-full w-px', i < 2 ? 'bg-orange-500' : 'bg-white/10')} />}
                      <span className={cn('relative z-10 mt-1 grid size-6 shrink-0 place-items-center rounded-full border', active ? 'border-orange-500 bg-orange-500 text-zinc-950' : 'border-white/15 bg-zinc-900 text-zinc-600')}>
                        {i < 2 ? <Check className="size-3.5" /> : <CircleDot className={cn('size-3', i === 2 && 'animate-pulse')} />}
                      </span>
                      <div>
                        <div className={cn('text-xs sm:text-sm font-bold', active ? 'text-white' : 'text-zinc-600')}>{item}</div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">{i === 2 ? 'Live · Mathura Road · 12:46 PM' : i < 2 ? `${11 + i}:2${i} AM` : 'Pending'}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Telemetry Cards */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { label: 'Vehicle Reg #', value: 'DL-01-LR-7218', Icon: Truck },
                { label: 'Axle Load Balance', value: '98.2% · BALANCED', Icon: Activity },
                { label: 'E-Seal Status', value: 'SECURED', Icon: ShieldCheck },
                { label: 'Live Speed & ETA', value: '54 km/h · 38 min', Icon: Navigation },
              ].map(tele => (
                <div key={tele.label} className="flex items-center gap-3.5 rounded-2xl border border-white/8 bg-zinc-950/70 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400"><tele.Icon className="size-4" /></span>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{tele.label}</div>
                    <div className={cn('mt-0.5 text-xs sm:text-sm font-bold', tele.label === 'E-Seal Status' ? 'text-emerald-400' : 'text-white')}>{tele.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TAB 4: PUDO LOCKERS */}
      <section id="lockers" className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'lockers' && 'hidden')}>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionTitle eyebrow="Smart terminal docks" title="Dispatch cleared. Bay ready." copy="Enter the driver’s 6-digit dispatch OTP to open the assigned bay shutter and issue a digital clearance slip." />
            <div className="max-w-sm rounded-2xl border border-white/8 bg-zinc-900/50 p-4 sm:p-5">
              <div className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950 font-mono text-lg sm:text-xl font-bold tracking-[.35em] text-orange-400">
                {Array.from({ length: 6 }, (_, i) => <span key={`digit-${i}`}>{otp[i] || '•'}</span>)}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9].map(n => <Button key={n} type="button" variant="outline" className="py-2.5" onClick={() => enterOtp(String(n))}>{n}</Button>)}
                <Button type="button" variant="ghost" className="py-2.5" onClick={() => setOtp(otp.slice(0, -1))}>⌫</Button>
                <Button type="button" variant="outline" className="py-2.5" onClick={() => enterOtp('0')}>0</Button>
                <Button type="button" variant="ghost" className="py-2.5 text-xs" onClick={resetDock}>CLR</Button>
              </div>
              <div className="mt-2.5 text-center text-[10px] uppercase tracking-widest text-zinc-500">Demo: enter any 6 digits</div>
            </div>
          </div>

          {/* Bay Shutter Grid */}
          <div className="relative">
            <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 rounded-2xl sm:rounded-3xl border p-3.5 sm:p-5 transition-all duration-500', unlocked ? 'border-orange-500/60 bg-orange-500/6 shadow-[0_0_60px_rgba(249,115,22,0.2)]' : 'border-white/8 bg-zinc-900/40')}>
              {Array.from({ length: 16 }, (_, i) => {
                const target = i === 6
                return (
                  <div key={`bay-${i}`} className={cn('relative aspect-[1.25] sm:aspect-[1.15] rounded-xl border bg-zinc-950/80 p-2.5 transition duration-500', target && unlocked ? 'sm:translate-x-2 border-orange-400 bg-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'border-white/10')}>
                    <span className="text-[10px] font-mono text-zinc-500">A{String(i + 1).padStart(2, '0')}</span>
                    <span className={cn('absolute right-2.5 top-1/2 size-1.5 rounded-full', target && unlocked ? 'bg-orange-400' : 'bg-zinc-700')} />
                  </div>
                )
              })}
            </div>

            {unlocked && (
              <div className="mt-4 sm:absolute sm:inset-x-4 sm:bottom-4 flex items-center gap-3.5 rounded-2xl border border-orange-500/40 bg-zinc-950/95 p-3.5 sm:p-4 shadow-2xl">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-zinc-950"><LockKeyhole className="size-5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-black text-orange-400 truncate">Bay A07 Shutter Open</div>
                  <div className="text-[11px] text-zinc-400 truncate">Clearance #CL-24068 · Dispatch logged</div>
                </div>
                <PackageCheck className="size-5 text-emerald-400 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TAB 5: ANALYTICS */}
      <section id="analytics" className={cn('min-h-[70vh] border-t border-white/6 bg-zinc-900/25 px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'analytics' && 'hidden')}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionTitle eyebrow="Carrier & operations dashboard" title="Higher utilization. Cleaner corridors." copy="A live operating view of fleet velocity, emissions offset, and dead-mile reduction across Delhi NCR." />
            <Button type="button" variant="outline" className="mb-6 self-start md:self-auto" onClick={() => notify('Report exported to operations queue')}>
              <BarChart3 className="size-4" /> Export report
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Turnaround Time */}
            <div className="rounded-2xl border border-white/8 bg-zinc-950/70 p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Fleet turnaround time</div>
                  <div className="mt-1.5 text-2xl sm:text-3xl font-black">42 min</div>
                </div>
                <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400"><TrendingUp className="size-4" /></span>
              </div>
              <div className="mt-6 flex h-28 items-end gap-1.5 sm:gap-2">
                {[32,45,38,62,54,71,66,89,77,94,82,100].map((h, i) => (
                  <div key={`bar-${i}`} className="flex-1 rounded-t bg-gradient-to-t from-orange-600/40 to-orange-400" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-2.5 flex justify-between text-[9px] text-zinc-500"><span>JAN</span><span>DEC</span></div>
            </div>

            {/* Dead-Mileage Reduction */}
            <div className="rounded-2xl border border-white/8 bg-zinc-950/70 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Dead-mileage reduction</div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-black">78.4%</div>
              <div className="mt-5 space-y-3">
                {[
                  { name: 'ITO Corridor', value: 86 },
                  { name: 'Nehru Place', value: 78 },
                  { name: 'Saket Arterial', value: 71 },
                  { name: 'AIIMS Ring', value: 63 }
                ].map(r => (
                  <div key={r.name}>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="text-zinc-400">{r.name}</span>
                      <span className="font-bold text-white">{r.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${r.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emissions Offset */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/6 p-5 sm:p-6 md:col-span-2 lg:col-span-1">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
              <div className="text-[10px] uppercase tracking-wider text-zinc-400">Emissions offset</div>
              <div className="mt-1.5 text-4xl sm:text-5xl font-black text-orange-400">1,240T</div>
              <div className="mt-1 text-xs text-zinc-400">CO₂ avoided across NCR this quarter</div>
              <div className="mt-6 rounded-xl border border-white/7 bg-zinc-950/50 p-3">
                <div className="flex items-center gap-3">
                  <Truck className="size-4 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">18.6% fewer empty km</div>
                    <div className="text-[10px] text-zinc-500">via AI load consolidation</div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 rounded-xl border border-white/7 bg-zinc-950/50 p-3">
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">24 automated hubs</div>
                    <div className="text-[10px] text-zinc-500">connected across NCR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAB 6: CORRIDORS */}
      <section id="fleet-corridors" className={cn('min-h-[70vh] border-t border-zinc-800 bg-zinc-950 px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'corridors' && 'hidden')}>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Heavy commercial corridors" title="Ring-road intelligence for first and last mile." copy="WPE/EPE routing, municipal clearance, and virtual load consolidation backed by weigh-in-motion axle sensors." />
          <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: 'WPE / EPE Ring', value: 'OPEN · 68% LOAD', color: 'text-emerald-400' },
              { title: 'Peak-ban clearance', value: 'CLEAR AFTER 22:30', color: 'text-amber-400' },
              { title: 'Axle sensor array', value: 'BALANCED · ±1.8%', color: 'text-cyan-400' }
            ].map(c => (
              <button key={c.title} type="button" onClick={() => notify(`${c.title}: telemetry detail opened`)} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left hover:border-orange-500/40 cursor-pointer transition">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{c.title}</div>
                <div className={cn('mt-2 font-mono text-xs sm:text-sm font-bold', c.color)}>{c.value}</div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-2/3 bg-gradient-to-r from-orange-600 to-amber-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TAB 7: DEVELOPERS */}
      <section id="developers" className={cn('min-h-[70vh] border-t border-zinc-800 bg-zinc-900/25 px-4 py-12 sm:px-6 sm:py-20', activeTab !== 'developers' && 'hidden')}>
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionTitle eyebrow="Developer API" title="Build on the cargo grid." copy="Test booking, telemetry, and PUDO access flows against the DEX sandbox." />
            <div className="space-y-2">
              {['POST /v1/cargo/book-bay','GET /v1/radar/telemetry','POST /v1/pudo/unlock-otp'].map(endpoint => (
                <button key={endpoint} type="button" onClick={() => notify(`${endpoint} copied`)} className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 font-mono text-xs text-cyan-400 cursor-pointer hover:border-zinc-700">
                  <span className="truncate">{endpoint}</span><Code2 className="size-4 text-zinc-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
              <div className="flex gap-2">
                {['cURL','JavaScript','Python'].map((lang, i) => (
                  <span key={lang} className={cn('text-[10px] font-bold', i === 0 ? 'text-orange-400' : 'text-zinc-600')}>{lang}</span>
                ))}
              </div>
              <span className="font-mono text-[9px] text-emerald-400">SANDBOX ONLINE</span>
            </div>
            <pre className="overflow-x-auto p-4 sm:p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-400">
              <code>
                <span className="text-orange-400">curl</span> -X POST https://sandbox.dex.cargo/v1/cargo/book-bay{'\n'}
                {'  '}-H <span className="text-amber-400">"Authorization: Bearer dex_test_••••"</span>{'\n'}
                {'  '}-d <span className="text-cyan-400">'&#123;"origin":"KGM","destination":"ITO","kg":42&#125;'</span>
              </code>
            </pre>
            <div className="border-t border-zinc-800 p-3 sm:p-4">
              <Button type="button" variant="outline" onClick={() => notify('ALERT · simulated cold-chain breach at Bay 04')} className="border-rose-500/30 text-rose-400 hover:border-rose-500 w-full sm:w-auto">
                <Activity className="size-4" /> Inject anomaly
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Footer */}
      <footer className="border-t border-white/6 px-4 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-bold text-zinc-300">
            <Route className="size-4 text-orange-500 shrink-0" />
            <span>DEX Cargo · Freight & Fleet Intelligence</span>
          </div>
          <div>Consolidated loads. Faster fleets. Cleaner corridors.</div>
        </div>
      </footer>
    </main>
  )
}