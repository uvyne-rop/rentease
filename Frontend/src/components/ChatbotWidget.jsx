import { useState } from 'react'
import { MessageSquare, Send, X } from 'lucide-react'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([
    { from: 'bot', text: 'Hi there! I am RentEase bot. Ask me about rentals, payments, or account verification.' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return
    const userMessage = message.trim()
    setHistory(prev => [...prev, { from: 'user', text: userMessage }])
    setMessage('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get chatbot response')
      setHistory(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[360px] bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare size={18} /> RentEase Chat
            </div>
            <button type="button" onClick={() => setOpen(false)} className="opacity-90 hover:opacity-100">
              <X size={18} />
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className={`rounded-2xl p-3 ${item.from === 'bot' ? 'bg-slate-100 text-slate-800' : 'bg-primary-600 text-white self-end'}`}>
                <p className="text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask RentEase..."
                className="input-field flex-1"
              />
              <button type="button" onClick={sendMessage} disabled={loading}
                className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-70">
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-5 py-3 shadow-2xl hover:bg-primary-700 transition-colors">
        <MessageSquare size={18} />
        {open ? 'Close Chat' : 'Talk to RentEase'}
      </button>
    </div>
  )
}
