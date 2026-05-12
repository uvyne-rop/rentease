import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import AuthModal from '../components/AuthModal'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [authNeeded, setAuthNeeded] = useState(false)
  const [authModal, setAuthModal] = useState(null)

  useEffect(() => {
    fetch('/api/favorites', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.auth_required) { setAuthNeeded(true); return }
        setFavorites(d.favorites || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100">
            <div className="h-48 bg-slate-200 rounded-t-2xl" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (authNeeded) return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">
          Sign in to view your saved homes
        </h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Create a free account to save properties and revisit them any time.
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
            Saved Homes ❤️
          </h1>
          <p className="text-primary-200 mt-2">
            {favorites.length === 0
              ? 'You have no saved properties yet.'
              : `${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-5">🏠</div>
            <h3 className="text-2xl font-bold text-slate-900 font-display mb-3">
              No saved homes yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              While browsing, click the ❤️ heart icon on any property to save it here for later.
            </p>
            <Link to="/listings" className="btn-primary">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favorites.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}