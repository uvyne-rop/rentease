import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Bed, Bath, Maximize2, MapPin } from 'lucide-react'
import AuthModal from '../components/AuthModal'
import { useToast } from '../context/ToastContext'

export default function ComparePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [authNeeded, setAuthNeeded] = useState(false)
  const [authModal, setAuthModal] = useState(null)
  const toast = useToast()

  useEffect(() => { 
    fetch('/api/compare', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.auth_required) { setAuthNeeded(true); return }
        setItems(d.compare || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    await fetch(`/api/compare/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems(prev => prev.filter(p => p.id !== id))
    toast.show('Removed from compare.', 'info')
  }

  const rows = [
    {
      label: 'Price',
      render: (p) => (
        <span className="font-bold text-primary-700">
          Sh{p.price.toLocaleString()} / {p.price_period}
        </span>
      ),
    },
    { label: 'Type',      render: (p) => p.type || '—' },
    { label: 'County',    render: (p) => p.county || '—' },
    { label: 'Location',  render: (p) => p.location || '—' },
    {
      label: 'Bedrooms',
      render: (p) => p.bedrooms > 0
        ? <span className="flex items-center gap-1.5"><Bed size={14} className="text-slate-400" />{p.bedrooms}</span>
        : '—',
    },
    {
      label: 'Bathrooms',
      render: (p) => p.bathrooms > 0
        ? <span className="flex items-center gap-1.5"><Bath size={14} className="text-slate-400" />{p.bathrooms}</span>
        : '—',
    },
    {
      label: 'Area',
      render: (p) => p.area_sqft
        ? <span className="flex items-center gap-1.5"><Maximize2 size={14} className="text-slate-400" />{p.area_sqft} sq ft</span>
        : '—',
    },
    {
      label: 'Amenities',
      render: (p) => p.amenities?.length
        ? <span className="text-xs">{p.amenities.slice(0, 3).join(', ')}{p.amenities.length > 3 ? ` +${p.amenities.length - 3} more` : ''}</span>
        : '—',
    },
  ]

  if (loading) return (
    <div className="pt-24 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )

  if (authNeeded) return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-slate-900 font-display mb-2">
          Sign in to compare properties
        </h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Compare is a power feature for registered users. Sign in to unlock it.
        </p>
        <button onClick={() => setAuthModal('login')} className="btn-primary">
          Sign In
        </button>
        {authModal && (
          <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
        )}
      </div>
    </div>
  )

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold font-display text-white">
            Compare Properties 🔄
          </h1>
          <p className="text-primary-200 mt-2">
            Side-by-side comparison of up to 4 properties.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-5">🔄</div>
            <h3 className="text-2xl font-bold text-slate-900 font-display mb-3">
              Nothing to compare yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Click the 🔄 compare icon on any property listing to add it here.
              You can compare up to 4 properties side by side.
            </p>
            <Link to="/listings" className="btn-primary">
              Browse Listings
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Comparing {items.length} {items.length === 1 ? 'property' : 'properties'} —{' '}
              <Link to="/listings" className="text-primary-600 hover:text-primary-800 font-medium">
                add more from listings
              </Link>
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-5 text-sm font-semibold text-slate-500 bg-slate-50 w-32 sticky left-0 z-10">
                      Feature
                    </th>
                    {items.map(p => (
                      <th key={p.id} className="p-4 border-l border-slate-200 bg-slate-50 text-left min-w-[180px]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                            {p.type}
                          </span>
                          <button
                            onClick={() => remove(p.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Remove from compare">
                            <X size={15} />
                          </button>
                        </div>
                        <img
                          src={p.images?.[0]}
                          alt={p.title}
                          className="w-full h-28 object-cover rounded-xl mb-3"
                        />
                        <Link
                          to={`/property/${p.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-primary-700 transition-colors block leading-snug line-clamp-2">
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
                          <MapPin size={11} className="text-primary-400 shrink-0" />
                          {p.location}, {p.county}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ label, render }, ri) => (
                    <tr key={label} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-500 border-b border-slate-100 sticky left-0 bg-inherit">
                        {label}
                      </td>
                      {items.map(p => (
                        <td key={p.id} className="p-4 text-sm text-slate-800 border-l border-b border-slate-100">
                          {render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* View button row */}
                  <tr className="bg-white">
                    <td className="p-4 sticky left-0 bg-white" />
                    {items.map(p => (
                      <td key={p.id} className="p-4 border-l border-slate-100">
                        <Link
                          to={`/property/${p.id}`}
                          className="btn-primary text-sm py-2 px-4 block text-center">
                          View Property
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}