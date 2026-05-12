import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LayoutGrid, List, Shield, Star, Zap, MapPin, Phone } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'bedrooms', label: 'Bedrooms' },
]

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState('grid')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetch('/api/properties?featured=1&sort=' + sort, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort])

  const stats = [
    { label: 'Properties Listed', value: '100+' },
    { label: 'Happy Tenants', value: '500+' },
    { label: 'Counties Covered', value: '12+' },
    { label: 'Years of Service', value: '3+' },
  ]

  return (
    <div className="pt-16 lg:pt-20">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85"
            alt="Beautiful Kenyan home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-primary-600/20 backdrop-blur-sm border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin size={14} />
              Serving All Across Kenya
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Find Your
              <br />
              <span className="text-primary-400">Perfect Home</span>
              <br />
              With Us
            </h1>

            <p className="text-lg text-slate-300 mb-4 leading-relaxed">
              Browse apartments, bedsitters, Airbnbs and rentals across Kenya.
              From Nairobi to Mombasa — your next home is here.
            </p>

            <div className="flex items-center gap-2 mb-8">
              <a href="tel:  +254798641087" className="flex items-center gap-2 text-primary-300 hover:text-primary-200 font-semibold text-lg transition-colors">
                <Phone size={18} />
                  +254798641087
              </a>
            </div>

            <Link to="/properties-for-rent"
              className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4 rounded-xl">
              I'm Looking To Rent
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Search card */}
          <div className="mt-12 max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white font-display">{s.value}</p>
                <p className="text-primary-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 font-display">Featured Listings</h2>
            <p className="text-slate-500 mt-1">{properties.length} featured properties</p>
          </div>

          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="input-field w-44 text-sm py-2">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setLayout('grid')}
                className={`px-3 py-2 transition-colors ${layout === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setLayout('list')}
                className={`px-3 py-2 transition-colors ${layout === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100">
                <div className="h-48 bg-slate-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-4'}>
            {properties.map(p => <PropertyCard key={p.id} property={p} layout={layout} />)}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/listings" className="btn-secondary inline-flex items-center gap-2">
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-display mb-3">Why Choose Us?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We connect you with the best properties across Kenya, with no hidden fees and full transparency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'Every property is verified by our team to ensure accuracy and quality before it goes live.', color: 'text-emerald-600 bg-emerald-100' },
              { icon: Star, title: 'Premium Quality', desc: 'From budget bedsitters to luxury showrooms — we curate properties for every lifestyle and budget.', color: 'text-amber-600 bg-amber-100' },
              { icon: Zap, title: 'Fast & Easy', desc: 'Search, filter by county, price, and type. Contact landlords directly with one click.', color: 'text-blue-600 bg-blue-100' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}>
                  <Icon size={26} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to Find Your Home?</h2>
          <p className="text-primary-200 text-lg mb-8">Browse hundreds of verified listings across Kenya. No hidden fees, no hassle.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/listings" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
              Browse All Listings <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
