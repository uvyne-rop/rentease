import { useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AuthModal({ mode: initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode) // login | register | reset | verify
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', verification_code: '' })
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [error, setError] = useState('')
  const { login, register, resetPassword, verifyEmail, resendVerification } = useAuth()
  const toast = useToast()

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password)
        toast.show(`Welcome back, ${data.username}! 🏠`, 'success')
        onClose()
      } else if (mode === 'register') {
        const data = await register(form.username, form.email, form.password)
        setRegisteredEmail(form.email)
        toast.show(data.message, 'info')
        setMode('verify')
      } else if (mode === 'reset') {
        const data = await resetPassword(form.email)
        toast.show(data.message, 'info')
        setMode('login')
      } else if (mode === 'verify') {
        const data = await verifyEmail(registeredEmail, form.verification_code)
        toast.show(data.message || 'Email verified! Please sign in.', 'success')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Verify Email'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === 'login' ? 'Save your favourite homes and more' :
               mode === 'register' ? 'Start finding your perfect home' :
               mode === 'reset' ? 'Enter your email to reset your password' :
               `A verification code was sent to ${registeredEmail}`}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" required placeholder="Choose a username"
                  value={form.username} onChange={e => set('username', e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification Code</label>
              <input
                type="text" required
                placeholder="Enter 6-digit code"
                value={form.verification_code} onChange={e => set('verification_code', e.target.value)}
                className="input-field pl-4"
              />
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {mode === 'login' ? 'Email or Username' : 'Email'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mode === 'login' ? 'text' : 'email'} required
                  placeholder={mode === 'login' ? 'Email or username' : 'Your email address'}
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              {mode === 'register' && (
                <p className="text-xs text-slate-400 mt-1">A verification code will be sent here</p>
              )}
            </div>
          )}

          {mode !== 'reset' && mode !== 'verify' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-field pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <ul className="text-xs text-slate-400 mt-2 space-y-0.5">
                  <li className={form.password.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</li>
                  <li className={/[0-9!@#$%^&*]/.test(form.password) ? 'text-green-600' : ''}>• Contains a number or symbol</li>
                </ul>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode('reset')}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Please wait...' :
             mode === 'login' ? 'Sign In' :
             mode === 'register' ? 'Create Account' :
             mode === 'verify' ? 'Verify Email' : 'Send Reset Link'}
          </button>

          {mode === 'verify' ? (
            <div className="text-center text-sm text-slate-500">
              <p className="mb-3">Didn't receive a code?</p>
              <button type="button" onClick={async () => {
                setLoading(true); setError('')
                try {
                  const data = await resendVerification(registeredEmail)
                  toast.show(data.message, 'success')
                } catch (err) {
                  setError(err.message)
                } finally {
                  setLoading(false)
                }
              }} className="text-primary-600 font-semibold hover:text-primary-800">
                Resend verification code
              </button>
              <p className="mt-4 text-slate-500">
                <button type="button" onClick={() => { setMode('login'); setError('') }}
                  className="text-primary-600 font-semibold hover:text-primary-800">
                  ← Back to login
                </button>
              </p>
            </div>
          ) : mode !== 'reset' ? (
            <p className="text-center text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className="text-primary-600 font-semibold hover:text-primary-800">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-slate-500">
              <button type="button" onClick={() => { setMode('login'); setError('') }}
                className="text-primary-600 font-semibold hover:text-primary-800">
                ← Back to login
              </button>
            </p>
          )}
        </form>

        {mode === 'register' && (
          <p className="text-xs text-slate-400 text-center pb-5 px-6">
            By signing up you agree to our Terms of Use and Privacy Policy
          </p>
        )}
      </div>
    </div>
  )
}