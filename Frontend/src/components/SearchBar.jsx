import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react'

const PROPERTY_TYPES = ['Airbnb', 'Apartments', 'Bedsitters', 'Rentals', 'Show Room House']
const KENYA_COUNTIES = ['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Machakos', 'Kajiado', 'Kisumu', 'Uasin Gishu', "Murang'a", 'Nyeri', 'Kwale', 'Kilifi']
const BED_BATH_OPTIONS = [{ label: 'Any', value: 'any' }, { label: '1+', value: '1' }, { label: '2+', value: '2' }, { label: '3+', value: '3' }, { label: '4+', value: '4' }]

function Dropdown({ label, children, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
          active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}>
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="filter-dropdown animate-fade-in" onClick={e => e.stopPropagation()}>
          {children(setOpen)}
        </div>
      )}
    </div>
  )
}

export default function SearchBar({ inline = false, defaultValues = {} }) {
  const navigate = useNavigate()
  const [text, setText] = useState(defaultValues.search || '')
  const [type, setType] = useState(defaultValues.type || '')
  const [county, setCounty] = useState(defaultValues.county || '')
  const [bedrooms, setBedrooms] = useState(defaultValues.bedrooms || 'any')
  const [bathrooms, setBathrooms] = useState(defaultValues.bathrooms || 'any')
  const [priceMin, setPriceMin] = useState(defaultValues.price_min || '')
  const [priceMax, setPriceMax] = useState(defaultValues.price_max || '')
  const [showMore, setShowMore] = useState(false)

  const hasFilters = type || county || bedrooms !== 'any' || bathrooms !== 'any' || priceMin || priceMax

  const buildQuery = () => {
    const p = new URLSearchParams()
    if (text) p.set('search', text)
    if (type) p.set('type', type)
    if (county) p.set('county', county)
    if (bedrooms && bedrooms !== 'any') p.set('bedrooms', bedrooms)
    if (bathrooms && bathrooms !== 'any') p.set('bathrooms', bathrooms)
    if (priceMin) p.set('price_min', priceMin)
    if (priceMax) p.set('price_max', priceMax)
    return p.toString()
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    navigate(`/listings?${buildQuery()}`)
  }

  const clearAll = () => {
    setText(''); setType(''); setCounty('')
    setBedrooms('any'); setBathrooms('any')
    setPriceMin(''); setPriceMax('')
  }

  const formClass = inline
    ? 'space-y-3'
    : 'bg-white rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4'

  return (
    <form onSubmit={handleSearch} className={formClass}>
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={text} onChange={e => setText(e.target.value)}
            placeholder="Search by location, county, or property name..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0 px-6 flex items-center gap-2">
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Price */}
        <Dropdown label={priceMin || priceMax ? `Sh${priceMin || '0'} – Sh${priceMax || '∞'}` : 'Price'} active={!!(priceMin || priceMax)}>
          {(close) => (
            <div className="w-64 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price Range (KES)</p>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Minimum</label>
                <input type="number" min="0" value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  placeholder="e.g. 10000"
                  className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Maximum</label>
                <input type="number" min="0" value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  placeholder="e.g. 80000"
                  className="input-field text-sm" />
              </div>
              <button type="button" onClick={() => close(false)}
                className="btn-primary w-full py-2 text-sm">Apply</button>
            </div>
          )}
        </Dropdown>

        {/* Type */}
        <Dropdown label={type || 'Type'} active={!!type}>
          {(close) => (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 pb-1">Property Type</p>
              {PROPERTY_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => { setType(t === type ? '' : t); close(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${type === t ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* County — Kenya-specific (replaces "State") */}
        <Dropdown label={county || 'County'} active={!!county}>
          {(close) => (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 pb-1">Kenya County</p>
              {KENYA_COUNTIES.map(c => (
                <button key={c} type="button"
                  onClick={() => { setCounty(c === county ? '' : c); close(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${county === c ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Bedrooms */}
        <Dropdown label={bedrooms === 'any' ? 'Bedrooms' : `${bedrooms} Bed`} active={bedrooms !== 'any'}>
          {(close) => (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 pb-1">Bedrooms</p>
              {BED_BATH_OPTIONS.map(o => (
                <button key={o.value} type="button"
                  onClick={() => { setBedrooms(o.value); close(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${bedrooms === o.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Bathrooms */}
        <Dropdown label={bathrooms === 'any' ? 'Bathrooms' : `${bathrooms} Bath`} active={bathrooms !== 'any'}>
          {(close) => (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 pb-1">Bathrooms</p>
              {BED_BATH_OPTIONS.map(o => (
                <button key={o.value} type="button"
                  onClick={() => { setBathrooms(o.value); close(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${bathrooms === o.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Clear all */}
        {hasFilters && (
          <button type="button" onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-slate-200">
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </form>
  )
}