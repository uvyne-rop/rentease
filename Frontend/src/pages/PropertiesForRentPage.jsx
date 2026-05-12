import { useState, useEffect } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'bedrooms',   label: 'Most bedrooms' },
]

export default function PropertiesForRentPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [layout, setLayout]         = useState('grid')
  const [sort, setSort]             = useState('newest')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/properties?sort=${sort}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort])

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-slate-50">

      {/* Hero header with search */}
      <div className="relative bg-gradient-to-br from-primary-700 to-primary-900 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-white mb-4">
            Properties For Rent
          </h1>
          <p className="text-primary-200 text-lg mb-8 max-w-xl">
            Find your next home from our full catalogue of verified rental properties across Kenya.
          </p>
          <div className="max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-slate-600 font-medium">
            {loading ? 'Loading...' : `${properties.length} rental ${properties.length === 1 ? 'property' : 'properties'}`}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setLayout('grid')}
                className={`px-3 py-2 transition-colors ${layout === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`px-3 py-2 transition-colors ${layout === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid / List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100">
                <div className="h-48 bg-slate-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className={layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'flex flex-col gap-4'}>
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} layout={layout} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}