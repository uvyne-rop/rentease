import { useState } from 'react'
import { getApiUrl } from '../utils/api'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(getApiUrl('/api/contact'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const contacts = [
    { icon: Phone,  label: 'Phone',    value: '  +254798641087',               href: 'tel:  +254798641087' },
    { icon: Mail,   label: 'Email',    value: 'agencyrentease@gmail.com', href: 'mailto:agencyrentease@gmail.com' },
    { icon: MapPin, label: 'Location', value: 'Nairobi, Kenya',           href: null },
  ]

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl font-bold font-display mb-4">Contact Us</h1>
          <p className="text-primary-200 text-lg">
            We'd love to hear from you. Reach out and we'll respond promptly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact info */}
          <div className="space-y-4">
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    {label}
                  </p>
                  {href
                    ? <a href={href} className="text-sm font-semibold text-slate-800 hover:text-primary-700 transition-colors break-all">{value}</a>
                    : <p className="text-sm font-semibold text-slate-800">{value}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
              {success ? (
                <div className="text-center py-12">
                  <CheckCircle size={52} className="text-primary-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">Thank you! We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
                    Send a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                      <input
                        type="text" required
                        value={form.name} onChange={e => set('name', e.target.value)}
                        className="input-field" placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                      <input
                        type="email" required
                        value={form.email} onChange={e => set('email', e.target.value)}
                        className="input-field" placeholder="Your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="input-field" placeholder="e.g. 07XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                    <textarea
                      required rows={5}
                      value={form.message} onChange={e => set('message', e.target.value)}
                      className="input-field resize-none"
                      placeholder="Tell us about the property you're looking for, or any questions you have..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}