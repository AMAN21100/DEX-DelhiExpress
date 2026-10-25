import { useState, useEffect } from 'react'
import type { AppPage } from '../App'

interface Props {
  onNavigate: (page: AppPage) => void
}

const busPositions = [
  { id: 'DL-764', x: 20, y: 35, route: '764', color: '#2D89EF' },
  { id: 'DL-302', x: 55, y: 55, route: '302', color: '#00C897' },
  { id: 'DL-411', x: 75, y: 25, route: '411', color: '#8B5CF6' },
  { id: 'DL-118', x: 35, y: 70, route: '118', color: '#F59E0B' },
]

const features = [
  { icon: '🧠', title: 'AI Demand Forecasting', desc: 'Predicts passenger demand by hour, route, and stop using historical data and real-time inputs', color: '#2D89EF' },
  { icon: '🚌', title: 'Smart Bus Allocation', desc: 'Automatically reallocates buses based on demand forecasts and real-time occupancy data', color: '#00C897' },
  { icon: '⏱️', title: 'Real-Time ETA Prediction', desc: 'ML-powered arrival time predictions with 94.2% accuracy using traffic and GPS data', color: '#8B5CF6' },
  { icon: '📦', title: 'DEX Cargo Freight-on-Transit', desc: 'Monetizes off-peak EV bus capacity to move urban parcels, cross-subsidizing free Pink Passes', color: '#F97316' },
  { icon: '🏠', title: 'Smart Bus Shelters', desc: 'Connected shelters with live ETA boards, PUDO parcel lockers, and solar monitoring', color: '#F59E0B' },
  { icon: '📍', title: 'Live Fleet Tracking', desc: 'Real-time GPS tracking of all 2,400+ buses across 642 routes in Delhi NCR', color: '#10B981' },
]

const steps = [
  { num: '01', icon: '📱', title: 'Passenger Books Ticket', desc: 'Passenger selects route, date, and time on the DEX app and books a digital QR ticket' },
  { num: '02', icon: '📡', title: 'Data Reaches AI Engine', desc: 'Booking, GPS, and crowd sensor data streams into the DEX-DelhiExpress AI Control Center in real time' },
  { num: '03', icon: '🧠', title: 'AI Predicts Demand', desc: 'Machine learning models analyze patterns and forecast demand at each stop and route segment' },
  { num: '04', icon: '🔄', title: 'Buses Auto-Allocated', desc: 'Fleet management system automatically dispatches and reroutes buses to match predicted demand' },
  { num: '05', icon: '🔔', title: 'Real-Time Updates Delivered', desc: 'Passengers receive live ETA, crowd level, and boarding platform updates on their devices' },
]

const impacts = [
  { icon: '🚗', value: '34%', label: 'Reduction in Traffic Congestion', color: '#2D89EF' },
  { icon: '🌿', value: '28%', label: 'Reduction in CO₂ Emissions', color: '#00C897' },
  { icon: '⏱️', value: '42%', label: 'Shorter Passenger Wait Times', color: '#8B5CF6' },
  { icon: '😊', value: '91%', label: 'Passenger Satisfaction Score', color: '#F59E0B' },
]

export default function Landing({ onNavigate }: Props) {
  const [busX, setBusX] = useState(busPositions.map(b => b.x))
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBusX(prev => prev.map(x => {
        const delta = (Math.random() - 0.5) * 3
        const newX = x + delta
        return Math.max(5, Math.min(90, newX))
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (linkName: string) => {
    if (linkName === 'Passenger Portal' || linkName === 'Live Tracking') {
      onNavigate('login-passenger')
    } else if (linkName === 'Admin Center' || linkName === 'AI Control') {
      onNavigate('login-admin')
    } else if (linkName === 'DEX Cargo' || linkName === 'Freight Network') {
      onNavigate('login-cargo')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="font-sans overflow-x-hidden text-slate-100 bg-slate-950">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-[5%] h-16 sm:h-20 flex items-center justify-between transition-all duration-300 ${
          scrollY > 40
            ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="size-9 sm:size-10 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0">
            🚌
          </div>
          <span className="font-['Poppins'] font-extrabold text-base sm:text-xl text-white tracking-tight truncate">
            DEX-DelhiExpress
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate('login-cargo')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-500/40 bg-orange-500/15 text-orange-400 font-['Poppins'] font-bold text-xs sm:text-sm hover:bg-orange-500/25 transition cursor-pointer active:scale-95"
          >
            <span>📦</span>
            <span>DEX Cargo</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('login-passenger')}
            className="hidden md:block px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white font-['Poppins'] font-semibold text-xs sm:text-sm hover:bg-white/10 transition cursor-pointer active:scale-95"
          >
            Passenger Portal
          </button>

          <button
            type="button"
            onClick={() => onNavigate('login-admin')}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border-none bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] text-white font-['Poppins'] font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
          >
            Control Center
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen bg-gradient-to-br from-[#060d1f] via-[#0d1f3c] to-[#071020] flex items-center px-4 sm:px-[5%] pt-28 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(45,137,239,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(45,137,239,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D89EF]/15 border border-[#2D89EF]/30 mx-auto lg:mx-0">
              <span className="size-2 rounded-full bg-[#00C897] animate-pulse" />
              <span className="text-[10px] sm:text-xs text-[#00C897] font-bold tracking-wider uppercase font-mono">
                LIVE SYSTEM ACTIVE — DELHI NCR
              </span>
            </div>

            <h1 className="font-['Poppins'] font-black text-3xl sm:text-5xl lg:text-6xl leading-[1.1] text-white tracking-tight">
              Transforming Delhi's{' '}
              <span className="bg-gradient-to-r from-[#2D89EF] to-[#00C897] bg-clip-text text-transparent">
                Public Transport
              </span>{' '}
              Through Artificial Intelligence
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              DEX-DelhiExpress uses real-time AI to predict demand, allocate buses intelligently, and deliver seamless transit and clean urban freight for 8 million commuters across Delhi NCR.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login-passenger')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-none bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] text-white font-['Poppins'] font-bold text-sm shadow-[0_8px_24px_rgba(45,137,239,0.4)] transition cursor-pointer active:scale-95 text-center"
              >
                🎫 Passenger Portal
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login-cargo')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 text-white font-['Poppins'] font-bold text-sm shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition cursor-pointer active:scale-95 text-center"
              >
                📦 DEX Cargo Portal
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login-admin')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-['Poppins'] font-bold text-sm hover:bg-emerald-500/20 transition cursor-pointer active:scale-95 text-center"
              >
                🔐 Control Center
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              {[
                { val: '2,400+', label: 'Active Buses' },
                { val: '642', label: 'Routes' },
                { val: '8M+', label: 'Daily Commuters' },
                { val: '420+', label: 'Cargo Lockers' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-['Poppins'] font-extrabold text-xl sm:text-2xl text-white">{s.val}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Bus Radar Preview */}
          <div className="relative h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#0d2040] border border-blue-500/25 shadow-2xl p-4">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(45,137,239,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,137,239,0.1) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 400 460">
              <path d="M 50 230 Q 150 100 300 200 Q 350 240 380 300" stroke="rgba(45,137,239,0.3)" strokeWidth="3" fill="none" strokeDasharray="6 4" />
              <path d="M 0 150 L 400 280" stroke="rgba(0,200,151,0.2)" strokeWidth="2" fill="none" strokeDasharray="6 4" />
              <path d="M 200 0 L 180 460" stroke="rgba(139,92,246,0.2)" strokeWidth="2" fill="none" strokeDasharray="6 4" />
            </svg>

            {busPositions.map((bus, i) => (
              <div
                key={bus.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-10"
                style={{ left: `${busX[i]}%`, top: `${bus.y}%` }}
              >
                <div
                  className="rounded-lg px-2 py-0.5 text-[10px] font-bold text-white shadow-md font-mono flex items-center gap-1"
                  style={{ backgroundColor: bus.color, boxShadow: `0 4px 14px ${bus.color}66` }}
                >
                  <span>🚌</span>
                  <span>{bus.route}</span>
                </div>
              </div>
            ))}

            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-white">DELHI NCR LIVE RADAR</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-20 sm:py-28 px-4 sm:px-[5%] bg-slate-100 text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2D89EF] text-xs font-bold uppercase tracking-widest mb-3">
              CORE CAPABILITIES
            </span>
            <h2 className="font-['Poppins'] font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
              Built for India's Most Complex Transit Network
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Integrated intelligent modules working together to make Delhi's public transport smarter, safer, and cleaner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => {
                  if (f.title.includes('Cargo')) onNavigate('login-cargo')
                }}
                className={`bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs transition hover:-translate-y-1 hover:shadow-xl ${
                  f.title.includes('Cargo') ? 'cursor-pointer ring-2 ring-orange-500/30' : ''
                }`}
              >
                <div
                  className="size-12 rounded-xl flex items-center justify-center text-2xl mb-4 border"
                  style={{ backgroundColor: `${f.color}12`, borderColor: `${f.color}30` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-['Poppins'] font-bold text-lg text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed m-0">
                  {f.desc}
                </p>
                {f.title.includes('Cargo') && (
                  <div className="mt-4 text-xs font-bold text-orange-600 flex items-center gap-1">
                    <span>Open DEX Cargo Portal</span>
                    <span>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 px-4 sm:px-[5%] bg-gradient-to-br from-[#060d1f] to-[#0d1f3c] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#00C897] text-xs font-bold uppercase tracking-widest mb-3">
              HOW IT WORKS
            </span>
            <h2 className="font-['Poppins'] font-black text-2xl sm:text-4xl text-white tracking-tight">
              From Booking to Boarding in 5 AI-Powered Steps
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-white/4 border border-white/8 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 backdrop-blur-md"
              >
                <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-400">{step.num}</span>
                    <h3 className="font-['Poppins'] font-bold text-base sm:text-lg text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed m-0">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTED IMPACT */}
      <section className="py-20 sm:py-28 px-4 sm:px-[5%] bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00C897] text-xs font-bold uppercase tracking-widest mb-3">
              PROJECTED IMPACT
            </span>
            <h2 className="font-['Poppins'] font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
              Measurable Change for Delhi's 8 Million Commuters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((item, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-2xl p-7 text-center border border-slate-200 relative overflow-hidden shadow-xs"
              >
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-3xl mb-3">{item.icon}</div>
               <div className="font-[Poppins] font-black text-4xl" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="py-16 sm:py-20 px-4 sm:px-[5%] bg-gradient-to-r from-[#2D89EF] via-[#1a6fd4] to-[#0f4fa0] text-center relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-4">
          <h2 className="font-['Poppins'] font-black text-2xl sm:text-4xl text-white tracking-tight">
            Experience the Future of Delhi Transit
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            AI-powered, passenger-first, and clean urban freight built for Delhi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('login-passenger')}
              className="px-6 py-3 rounded-xl bg-white text-[#2D89EF] font-['Poppins'] font-bold text-xs sm:text-sm shadow-md transition hover:bg-blue-50 cursor-pointer active:scale-95"
            >
              🎫 Try Passenger Portal
            </button>
            <button
              type="button"
              onClick={() => onNavigate('login-cargo')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-['Poppins'] font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
            >
              📦 Book DEX Cargo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('login-admin')}
              className="px-6 py-3 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-['Poppins'] font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95"
            >
              🔐 Admin Control Center
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#060d1f] py-12 sm:py-16 px-4 sm:px-[5%] text-slate-400 text-xs sm:text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-base">
                🚌
              </div>
              <span className="font-['Poppins'] font-extrabold text-base text-white">DEX-DelhiExpress</span>
            </div>
            <p className="text-xs text-slate-400/80 leading-relaxed">
              AI-powered smart public transport ecosystem for Delhi NCR. Reducing congestion, pollution, and wait times for millions of daily commuters.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['🏆 WRO 2026', '🌐 Smart City Award', '🤖 AI Excellence'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/25 text-[#2D89EF] text-[10px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Passenger Portal', 'Admin Center', 'DEX Cargo', 'Live Tracking'] },
            { title: 'Project', links: ['About DEX', 'Our Team', 'Research Paper', 'WRO Competition'] },
            { title: 'Contact', links: ['Delhi Transport Dept.', 'Smart City Mission', 'Press Inquiries', 'Technical Support'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-['Poppins'] font-bold text-xs text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => handleLinkClick(link)}
                      className="text-slate-400 hover:text-white transition cursor-pointer text-left text-xs"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 DEX-DelhiExpress. Designed for WRO AI for Good Category.</div>
          <div>Made with 🧠 AI + ❤️ for Delhi</div>
        </div>
      </footer>
    </div>
  )
}