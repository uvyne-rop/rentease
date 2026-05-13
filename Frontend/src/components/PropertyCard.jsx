import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, GitCompare, MapPin, Bed, Bath, Maximize2, Star, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiUrl } from '../utils/api'
import AuthModal from './AuthModal'
import PaymentModal from './PaymentPrompt'

const TYPE_COLORS = {
  'Airbnb': 'bg-rose-100 text-rose-700',
  'Apartments': 'bg-blue-100 text-blue-700',
  'Bedsitters': 'bg-purple-100 text-purple-700',
  'Rentals': 'bg-amber-100 text-amber-700',
  'Show Room House': 'bg-emerald-100 text-emerald-700',
}

export default function PropertyCard({ property, layout = 'grid' }) {
  const { user } = useAuth()
  const toast = useToast()
  const [isFav, setIsFav] = useState(property.is_favorited || false)
  const [authModal, setAuthModal] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [favLoading, setFavLoading] = useState(false)
  const [compareLoading, setCompareLoading] = useState(false)

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80']

  const handleFav = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { setAuthModal('login'); return }
    setFavLoading(true)
    try {
      const method = isFav ? 'DELETE' : 'POST'
      const res = await fetch(getApiUrl(`/api/favorites/${property.id}`), { method, credentials: 'include' })
      const data = await res.json()
      if (data.auth_required) { setAuthModal('login'); return }
      setIsFav(!isFav)
      toast.show(isFav ? 'Removed from favourites.' : 'Saved to favourites! ❤️', isFav ? 'info' : 'success')
    } catch {
      toast.show('Something went wrong. Please try again.', 'error')
    } finally {
      setFavLoading(false)
    }
  }

  const handleCompare = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.show('Sign in to compare properties. Compare is a power feature for registered users.', 'info')
      setAuthModal('login')
      return
    }
    setCompareLoading(true)
    try {
      const res = await fetch(getApiUrl(`/api/compare/${property.id}`), { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.auth_required) { setAuthModal('login'); return }
      if (data.error) { toast.show(data.error, 'error'); return }
      toast.show('Added to compare list! 🔄', 'success')
    } catch {
      toast.show('Something went wrong.', 'error')
    } finally {
      setCompareLoading(false)
    }
  }

  const prevImg = (e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }
  const nextImg = (e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }

  const handleSecure = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { setAuthModal('login'); return }
    setShowPayment(true)
  }

  const formatPrice = (price, period) => {
    return `Sh${price.toLocaleString()} / ${period}`
  }

  if (layout === 'list') {
    return (
      <>
        <Link to={`/property/${property.id}`} className="card flex flex-col sm:flex-row group animate-fade-in">
          {/* Image */}
          <div className="relative sm:w-72 h-52 sm:h-auto shrink-0 overflow-hidden">
            <img src={images[imgIdx]} alt={property.title} className="gallery-img w-full h-full object-cover" loading="lazy" />
            {property.featured === 1 && (
              <span className="absolute top-3 left-3 badge bg-amber-400 text-amber-900"><Star size={11} /> Featured</span>
            )}
            <span className={`absolute top-3 right-3 badge ${TYPE_COLORS[property.type] || 'bg-slate-100 text-slate-600'}`}>{property.type}</span>
          </div>
          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary-700 transition-colors">{property.title}</h3>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleFav} disabled={favLoading}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-400'}`}>
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleCompare} disabled={compareLoading}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-400 transition-all">
                    <GitCompare size={16} />
                  </button>
                  <button onClick={handleSecure}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-600 transition-all" title="Secure this property">
                    <Lock size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                <MapPin size={14} className="text-primary-500 shrink-0" />
                {property.location}, {property.county}
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{property.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex gap-4 text-sm text-slate-600">
                {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={15} className="text-slate-400" />{property.bedrooms} bed</span>}
                {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={15} className="text-slate-400" />{property.bathrooms} bath</span>}
                {property.area_sqft > 0 && <span className="flex items-center gap-1"><Maximize2 size={15} className="text-slate-400" />{property.area_sqft} sq ft</span>}
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-700 text-lg">{formatPrice(property.price, property.price_period)}</p>
              </div>
            </div>
          </div>
        </Link>
        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
        {showPayment && <PaymentModal property={property} onClose={() => setShowPayment(false)} />}
      </>
    )
  }

  // Grid layout (default)
  return (
    <>
      <Link to={`/property/${property.id}`} className="card group flex flex-col animate-fade-in">
        {/* Image gallery */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <img src={images[imgIdx]} alt={property.title} className="gallery-img w-full h-full object-cover" loading="lazy" />
          {images.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured === 1 && (
              <span className="badge bg-amber-400 text-amber-900 text-xs shadow-sm"><Star size={10} fill="currentColor" /> Featured</span>
            )}
          </div>
          <span className={`absolute top-3 right-3 badge text-xs shadow-sm ${TYPE_COLORS[property.type] || 'bg-slate-100 text-slate-600'}`}>{property.type}</span>

          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleSecure}
              className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
              title="Secure this property">
              <Lock size={15} />
            </button>
            <button onClick={handleFav} disabled={favLoading}
              className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all ${
                isFav ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 hover:text-rose-500'
              }`}
              title={isFav ? 'Remove from favourites' : 'Save to favourites'}>
              <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleCompare} disabled={compareLoading}
              className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all"
              title="Add to compare">
              <GitCompare size={15} />
            </button>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-2 mb-1">
            <MapPin size={13} className="text-primary-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 leading-snug">{property.location}, {property.county}</p>
          </div>
          <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">{property.description}</p>

          {/* Stats */}
          <div className="flex gap-3 text-xs text-slate-500 mb-3">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed size={12} className="text-slate-400" />{property.bedrooms} bed</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1"><Bath size={12} className="text-slate-400" />{property.bathrooms} bath</span>
            )}
            {property.area_sqft > 0 && (
              <span className="flex items-center gap-1"><Maximize2 size={12} className="text-slate-400" />{property.area_sqft} sqft</span>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="font-bold text-primary-700 text-base">{formatPrice(property.price, property.price_period)}</p>
          </div>
        </div>
      </Link>
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
      {showPayment && <PaymentModal property={property} onClose={() => setShowPayment(false)} />}
    </>
  )
}
