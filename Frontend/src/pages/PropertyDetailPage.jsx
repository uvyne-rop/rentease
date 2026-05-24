import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Bed, Bath, Maximize2, Heart, GitCompare, Share2, Lock,
  ArrowLeft, Phone, Mail, Star, CheckCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { getApiUrl } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthModal from '../components/AuthModal'
import PaymentModal from '../components/PaymentPrompt'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast    = useToast()

  const [property,  setProperty]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [imgIdx,    setImgIdx]    = useState(0)
  const [isFav,     setIsFav]     = useState(false)
  const [authModal, setAuthModal] = useState(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    fetch(getApiUrl(`/api/properties/${id}`), { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setProperty(d.property)
        setIsFav(d.property?.is_favorited || false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleFav = async () => {
    if (!user) { setAuthModal('login'); return }
    try {
      const method = isFav ? 'DELETE' : 'POST'
      const res  = await fetch(getApiUrl(`/api/favorites/${id}`), { method, credentials: 'include' })
      const data = await res.json()
      if (data.auth_required) { setAuthModal('login'); return }
      setIsFav(!isFav)
      toast.show(
        isFav ? 'Removed from favourites.' : 'Saved to favourites! ❤️',
        isFav ? 'info' : 'success',
      )
    } catch {
      toast.show('Something went wrong.', 'error')
    }
  }

  const handleCompare = async () => {
    if (!user) {
      toast.show('Sign in to compare properties. Compare is a power feature for registered users.', 'info')
      setAuthModal('login')
      return
    }
    try {
      const res  = await fetch(getApiUrl(`/api/compare/${id}`), { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.auth_required) { setAuthModal('login'); return }
      if (data.error)         { toast.show(data.error, 'error'); return }
      toast.show('Added to compare list! 🔄', 'success')
    } catch {
      toast.show('Something went wrong.', 'error')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.show('Link copied to clipboard!', 'success')
    }
  }

  const handleSecure = () => {
    if (!user) { setAuthModal('login'); return }
    setShowPayment(true)
  }

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-4">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="h-6 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  )

  /* ── Not found ── */
  if (!property) return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏚️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Property not found</h2>
        <Link to="/listings" className="btn-primary">Browse All Listings</Link>
      </div>
    </div>
  )

  const images     = property.images?.length
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80']
  const hasDetails = property.bedrooms > 0 || property.bathrooms > 0 || property.area_sqft > 0

  return (
    <>
      <div className="pt-16 lg:pt-20 min-h-screen pb-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Back */}
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 mb-5 transition-colors">
            <ArrowLeft size={16} /> Back to listings
          </Link>

          {/* ── Image gallery ── */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-200 mb-6" style={{ height: '440px' }}>
            <img
              src={images[imgIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                  <ChevronRight size={20} />
                </button>
                {/* Thumbnail strip */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-white' : 'border-white/30 opacity-60'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              {imgIdx + 1} / {images.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title & actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {property.featured === 1 && (
                        <span className="badge bg-amber-100 text-amber-700">
                          <Star size={11} fill="currentColor" /> Featured
                        </span>
                      )}
                      {property.type && (
                        <span className="badge bg-primary-100 text-primary-700">{property.type}</span>
                      )}
                      <span className="badge bg-green-100 text-green-700">For Rent</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 font-display leading-tight">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-2">
                      <MapPin size={15} className="text-primary-500" />
                      {property.address || `${property.location}, ${property.county}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSecure}
                      title="Secure this property"
                      className="w-11 h-11 rounded-full border-2 border-primary-500 bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center transition-all">
                      <Lock size={18} />
                    </button>
                    <button
                      onClick={handleFav}
                      title="Save to favourites"
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                        isFav
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-400'
                      }`}>
                      <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={handleCompare}
                      title="Add to compare"
                      className="w-11 h-11 rounded-full border-2 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center transition-all">
                      <GitCompare size={18} />
                    </button>
                    <button
                      onClick={handleShare}
                      title="Share"
                      className="w-11 h-11 rounded-full border-2 border-slate-200 text-slate-400 hover:border-slate-400 flex items-center justify-center transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
                {/* Price */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-3xl font-bold text-primary-700">
                    Sh{property.price.toLocaleString()}
                    <span className="text-base font-medium text-slate-500"> / {property.price_period}</span>
                  </p>
                </div>
              </div>

              {/* Property stats */}
              {hasDetails && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Property Details</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {property.bedrooms > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Bed size={22} className="text-primary-600 mx-auto mb-2" />
                        <p className="font-bold text-slate-900">{property.bedrooms}</p>
                        <p className="text-xs text-slate-500">Bedroom{property.bedrooms > 1 ? 's' : ''}</p>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Bath size={22} className="text-primary-600 mx-auto mb-2" />
                        <p className="font-bold text-slate-900">{property.bathrooms}</p>
                        <p className="text-xs text-slate-500">Bathroom{property.bathrooms > 1 ? 's' : ''}</p>
                      </div>
                    )}
                    {property.area_sqft > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Maximize2 size={22} className="text-primary-600 mx-auto mb-2" />
                        <p className="font-bold text-slate-900">{property.area_sqft}</p>
                        <p className="text-xs text-slate-500">sq ft</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle size={16} className="text-primary-500 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {property.features?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {property.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">
              {/* Contact card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-28">
                <h3 className="font-bold text-slate-900 mb-1">Interested in this property?</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Contact us and we'll get back to you promptly.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+254798641087"
                    className="flex items-center gap-3 w-full btn-primary justify-center">
                    <Phone size={18} /> Call Us
                  </a>
                  <a
                    href="mailto:agencyrentease@gmail.com"
                    className="flex items-center gap-3 w-full btn-secondary justify-center">
                    <Mail size={18} /> Email Us
                  </a>
                </div>
                <div className="mt-5 pt-5 border-t border-slate-100 text-center space-y-1">
                  <p className="text-xs text-slate-400">📞 +254798641087</p>
                  <p className="text-xs text-slate-400">agencyrentease@gmail.com</p>
                </div>
              </div>

              {/* Location card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-primary-500" /> Location
                </h3>
                <p className="text-sm text-slate-600">
                  {property.address || `${property.location}, ${property.county}, Kenya`}
                </p>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(property.address || property.location + ', Kenya')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block transition-colors">
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}
      {showPayment && property && (
        <PaymentModal property={property} onClose={() => setShowPayment(false)} />
      )}
    </>
  )
}