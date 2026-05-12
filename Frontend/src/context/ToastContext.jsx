import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const dismiss = (id) => setToasts(t => t.filter(x => x.id !== id))

  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const colors = {
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-slate-800 text-white',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
        {toasts.map(t => {
          const Icon = icons[t.type] || Info
          return (
            <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-medium max-w-sm animate-slide-up ${colors[t.type]}`}>
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)