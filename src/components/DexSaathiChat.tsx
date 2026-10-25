import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
}

const QUICK_PROMPTS = [
  'Best route to Connaught Place?',
  'How to get Women Pink Pass?',
  'Is Route 411 diverted?',
  'How to recharge DEX wallet?',
]

export default function DexSaathiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: 'Namaste! 🙏 I am DEX Saathi, your Delhi Express transit assistant. How can I help you navigate Delhi NCR today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  // Smart Transit Knowledge Engine (Offline Fallback)
  const getOfflineTransitResponse = (question: string): string => {
    const q = question.toLowerCase()

    if (q.includes('pink pass') || q.includes('women') || q.includes('free') || q.includes('mahila')) {
      return "🌸 Under the Delhi Government initiative, women commuters can travel for free across all DTC and feeder buses using the Pink Pass. In DEX, simply tick the 'Women\'s Pink Pass Scheme' checkbox on the Ticket Booking screen to generate a zero-fare (₹0.00) boarding pass!"
    }

    if (q.includes('411') || q.includes('diversion') || q.includes('divert')) {
      return '⚠️ Route 411 (Nehru Place ↔ Dwarka Sec-21) is currently operating on a temporary diversion via Govindpuri and Outer Ring Road due to infrastructure maintenance. Please allow an extra 15 minutes of travel time.'
    }

    if (q.includes('764') || (q.includes('dwarka') && q.includes('cp')) || (q.includes('connaught') && q.includes('dwarka'))) {
      return '🚌 Route 764 operates directly between Dwarka Sector 21 and Connaught Place via Dhaula Kuan. It runs every 8 minutes with an average journey time of 52 minutes. Fare: ₹30 (AC Low Floor).'
    }

    if (q.includes('302') || q.includes('dilshad') || q.includes('kashmere')) {
      return '🚌 Route 302 connects Dilshad Garden to Kashmere Gate ISBT via Shahdara. Frequency: 10 minutes. Fare: ₹25.'
    }

    if (q.includes('118') || q.includes('airport') || q.includes('t3')) {
      return '✈️ Route 118 connects Airport Terminal 3 to Mahipalpur with direct connection to the Delhi Airport Express Metro line.'
    }

    if (q.includes('recharge') || q.includes('wallet') || q.includes('money') || q.includes('balance')) {
      return '👛 You can recharge your DEX Wallet by visiting the "Profile" tab and clicking the "+ Add Money" button. We support instant top-ups of ₹100, ₹200, ₹500, or custom amounts via UPI (GPay, PhonePe, Paytm).'
    }

    if (q.includes('metro') || q.includes('card') || q.includes('dmrc') || q.includes('smart card')) {
      return '💳 DEX is integrated with Delhi Metro Smart Cards! You can view your linked DTC/Metro card on your Dashboard and tap to enter all designated smart shelters.'
    }

    if (q.includes('safety') || q.includes('emergency') || q.includes('police') || q.includes('sos')) {
      return '🚨 For immediate emergencies on-board, press the in-app SOS button or dial 112 (Delhi Police). The DEX Central Safety Center monitors CCTV feeds and overcrowding metrics 24/7.'
    }

    return 'I can help you with routes, fares, arrival ETAs, and transit schemes across Delhi NCR! Try asking about Route 764, Route 411 diversion, or the zero-fare Pink Pass.'
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (apiKey) {
      try {
        const systemPrompt = `You are DEX Saathi, the official smart AI transit assistant for DEX-DelhiExpress (Delhi NCR public transit network).
Current Delhi transit context:
- Route 764: Dwarka Sec 21 to Connaught Place via Dhaula Kuan (Fare: ₹30, 8-min frequency)
- Route 302: Dilshad Garden to Kashmere Gate ISBT (Fare: ₹25)
- Route 411: Nehru Place to Dwarka Sec 21 (Diverted via Govindpuri)
- Route 118: Airport T3 to Mahipalpur
- Route 550: Noida Sec 18 to Connaught Place
- Pink Pass Scheme: Free zero-fare rides for women commuters across all Delhi buses
- Payments: UPI, DEX native wallet, and Metro Smart Card.
Answer concisely in 2 to 3 sentences in warm, clear Indian English or polite Hinglish.`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nCommuter query: ${text}` }] }],
            }),
          }
        )

        const data = await response.json()
        const botReply =
          data.candidates?.[0]?.content?.parts?.[0]?.text || getOfflineTransitResponse(text)

        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: botReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsTyping(false)
        return
      } catch (err) {
        console.warn('Gemini API fetch error, switching to offline fallback:', err)
      }
    }

    // Fallback response with realistic delay
    setTimeout(() => {
      const botReply = getOfflineTransitResponse(text)
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 550)
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open DEX Saathi AI Chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 size-12 sm:size-14 rounded-full bg-gradient-to-br from-[#2D89EF] to-[#00C897] text-white flex items-center justify-center text-xl sm:text-2xl shadow-[0_8px_24px_rgba(45,137,239,0.45)] hover:scale-105 active:scale-95 transition-transform z-50 cursor-pointer"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-20 sm:right-6 w-full sm:w-[390px] h-[85vh] sm:h-[540px] max-h-[680px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-50 font-sans animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-base sm:text-lg shrink-0 shadow-sm">
                  🤖
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm tracking-tight text-white">DEX Saathi</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI Transit Assistant
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isUser
                          ? 'rounded-2xl rounded-br-xs bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] text-white'
                          : 'rounded-2xl rounded-bl-xs bg-white text-slate-800 border border-slate-200/80'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 px-1 font-mono">
                      {m.time}
                    </span>
                  </div>
                )
              })}

              {isTyping && (
                <div className="self-start px-3.5 py-2 rounded-2xl rounded-bl-xs bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-1.5 shadow-xs">
                  <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">DEX Saathi is typing…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Drawer */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition shrink-0 cursor-pointer active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask routes, Pink Pass, fares…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D89EF] transition bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#2D89EF] hover:bg-[#2577d4] disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}