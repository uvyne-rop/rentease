import { useState } from 'react'
import { getApiUrl } from '../utils/api'
import { CreditCard, X } from 'lucide-react'

export default function PaymentModal({ property, onClose }) {
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('Mpesa')
  const [paybill, setPaybill] = useState('')
  const [account, setAccount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(getApiUrl('/api/pay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          paybill,
          account,
          payment_method: method,
          property_id: property.id
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      setMessage(`Success! Reference: ${data.details.reference}`)
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Secure Property</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">Property</p>
            <p className="font-bold text-slate-900">{property.title}</p>
            <p className="text-sm text-primary-700 font-semibold mt-2">Security Deposit: KES 500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0712345678"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
              <option>Mpesa</option>
              <option>Bank Transfer</option>
              <option>Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Paybill Number</label>
            <input
              type="text"
              value={paybill}
              onChange={e => setPaybill(e.target.value)}
              placeholder="e.g., 123456"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
            <input
              type="text"
              value={account}
              onChange={e => setAccount(e.target.value)}
              placeholder="Property ID or reference"
              className="input-field"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
          {message && <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded">{message}</div>}

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : `Pay KES 500 & Secure Property`}
            {!loading && <CreditCard size={18} />}
          </button>
        </form>

        <div className="px-6 pb-4 border-t border-slate-100 text-xs text-slate-500">
          <p>Your security deposit will be held and used towards your rental agreement.</p>
        </div>
      </div>
    </div>
  )
}
