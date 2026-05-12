import { Link } from 'react-router-dom'
import { Target, Eye, Heart, MapPin, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pt-16 lg:pt-20 min-h-screen">

      {/* Hero */}
      
      <div className="relative bg-gradient-to-br from-primary-700 to-primary-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-5xl font-bold font-display mb-5">Meet The Team</h1>
          <p className="text-xl text-primary-200 leading-relaxed max-w-2xl mx-auto">
            The passionate people behind Rent Ease And Homes Agency — dedicated to connecting Kenyans with their perfect homes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

        {/* M-Collection Paybill */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#F85018] rounded-xl flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#fff"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-[#D01010] font-display">M-Collection Paybill</h2>
          </div>
          <div className="bg-[#FFF6F4] border-l-4 border-[#D01010] p-5 rounded-lg mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-lg font-semibold text-[#C01010]">Paybill No. <span className="font-mono">529914</span></div>
              <div className="text-lg font-semibold text-[#F85018]">Account No. <span className="font-mono">110322 </span></div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#E83808] rounded-xl flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-[#D01010] font-display">Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-[#FFF6F4] p-4 rounded-lg border-l-4 border-[#F02010]">
              {/* Placeholder for image */}
              <div className="w-14 h-14 bg-[#F85018] rounded-full flex items-center justify-center text-white font-bold text-xl">JS</div>
              <div>
                <div className="font-semibold text-[#D01010]">Jerry Simiyu</div>
                <div className="text-sm text-slate-600">Managing Director</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#FFF6F4] p-4 rounded-lg border-l-4 border-[#F02010]">
              <div className="w-14 h-14 bg-[#F85018] rounded-full flex items-center justify-center text-white font-bold text-xl">DR</div>
              <div>
                <div className="font-semibold text-[#D01010]">Denis Rodgers</div>
                <div className="text-sm text-slate-600">Administrative Director</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#FFF6F4] p-4 rounded-lg border-l-4 border-[#F02010]">
              <div className="w-14 h-14 bg-[#F85018] rounded-full flex items-center justify-center text-white font-bold text-xl">AL</div>
              <div>
                <div className="font-semibold text-[#D01010]">Aldrin Lwali</div>
                <div className="text-sm text-slate-600">Finance</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#FFF6F4] p-4 rounded-lg border-l-4 border-[#F02010]">
              <div className="w-14 h-14 bg-[#F85018] rounded-full flex items-center justify-center text-white font-bold text-xl">TO</div>
              <div>
                <div className="font-semibold text-[#D01010]">Tonny Omolo</div>
                <div className="text-sm text-slate-600">Marketer</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#FFF6F4] p-4 rounded-lg border-l-4 border-[#F02010]">
              <div className="w-14 h-14 bg-[#F85018] rounded-full flex items-center justify-center text-white font-bold text-xl">IT</div>
              <div>
                <div className="font-semibold text-[#D01010]">You</div>
                <div className="text-sm text-slate-600">IT</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">* Team member photos coming soon</div>
        </section>

        {/* Who Are We */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Who Are We</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">
            Rent Ease And Homes Agency is a Nairobi-based real estate platform dedicated to
            helping individuals and families across Kenya find quality rental homes. We bridge
            the gap between landlords and tenants with transparency, professionalism, and
            genuine care.
          </p>
        </section>

        {/* What We Do */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">What We Do</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg mb-4">
            We list and manage a wide range of residential properties — from budget-friendly
            bedsitters to premium showroom houses and coastal Airbnbs. Our platform allows renters to:
          </p>
          <ul className="space-y-3">
            {[
              'Browse hundreds of verified property listings across Kenya',
              'Filter by county, price range, property type, and amenities',
              'Save favourite properties and compare options side-by-side',
              'Contact landlords and agents directly through our platform',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-slate-600">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* How We Do It */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">How We Do It</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">
            Our team personally visits and verifies every property before it goes live. We
            work closely with landlords to ensure accurate descriptions, fair pricing, and
            quality standards. We believe in honest communication and zero hidden fees —
            what you see is what you get.
          </p>
        </section>

        {/* Where We Operate */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Where We Operate</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg mb-5">
            Headquartered in Nairobi, we operate across multiple counties in Kenya including:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Machakos', 'Kajiado', 'Kisumu', 'Kilifi'].map(c => (
              <span key={c} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold">
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
          <h3 className="text-2xl font-bold text-slate-900 font-display mb-3">
            Ready to find your home?
          </h3>
          <p className="text-slate-600 mb-6">
            Browse our full catalogue of verified rental listings across Kenya.
          </p>
          <Link to="/listings" className="btn-primary inline-flex items-center gap-2">
            Browse Listings <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}