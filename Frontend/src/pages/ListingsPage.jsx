import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'
import { getApiUrl } from '../utils/api'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'bedrooms',   label: 'Most bedrooms' },
]

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [layout, setLayout]         = useState('grid')
  const [sort, setSort]             = useState(searchParams.get('sort') || 'newest')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams(searchParams)
    params.set('sort', sort)
    fetch(getApiUrl(`/api/properties?${params.toString()}`), { credentials: 'include' })
      .then(r => r.json())
      .then(d => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchParams, sort])

  const defaultValues = {
    search:    searchParams.get('search')    || '',
    type:      searchParams.get('type')      || '',
    county:    searchParams.get('county')    || '',
    bedrooms:  searchParams.get('bedrooms')  || 'any',
    bathrooms: searchParams.get('bathrooms') || 'any',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
  }

  const activeFilters = Object.entries(defaultValues)
    .filter(([, v]) => v && v !== 'any').length

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-slate-50">

      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar inline defaultValues={defaultValues} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              {loading
                ? 'Loading…'
                : `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} Found`}
            </h1>
            {activeFilters > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} applied
              </p>
            )}
          </div>
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

        {/* Results */}
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
            <p className="text-slate-500">
              Try adjusting your search filters or clearing them to see all properties.
            </p>
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