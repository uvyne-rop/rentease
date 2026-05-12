import { Link } from 'react-router-dom'
import { Home, Mail, Phone, MapPin, Circle, Camera, X } from 'lucide-react'
import logo from '../assets/rentease-logo.png'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="RentEase and Homes Agency Logo" className="w-14 h-14 object-contain" />
              <div>
                <p className="text-sm font-bold text-white leading-tight font-display">RentEase and</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Homes Agency</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Find Your Perfect Home With Us. Kenya's trusted property rental platform.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/1DettmVWeC/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 bg-slate-800 hover:bg-[#D01010] rounded-lg flex items-center justify-center transition-colors duration-200">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a href="https://www.instagram.com/renteaseandhomesagency?igsh=aHRma3B2ZTN6eHdr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 bg-slate-800 hover:bg-[#F85018] rounded-lg flex items-center justify-center transition-colors duration-200">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.398 3.635 1.365 2.668 2.332 2.4 3.505 2.342 4.782.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.058 1.277.326 2.45 1.293 3.417.967.967 2.14 1.235 3.417 1.293C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.277-.058 2.45-.326 3.417-1.293.967-.967 1.235-2.14 1.293-3.417.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.058-1.277-.326-2.45-1.293-3.417-.967-.967-2.14-1.235-3.417-1.293C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.2-11.162a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="https://youtube.com/@renteaseandhomesagency?si=DWlaOKw7bu5iZ93r" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="w-9 h-9 bg-slate-800 hover:bg-[#C01010] rounded-lg flex items-center justify-center transition-colors duration-200">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.24 3.5 12 3.5 12 3.5s-7.24 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.337 0 12 0 12s0 3.663.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.76 20.5 12 20.5 12 20.5s7.24 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.663 24 12 24 12s0-3.663-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@rentease.and.home?_r=1&_t=ZS-93gzu8G15hS" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-9 h-9 bg-slate-800 hover:bg-[#E83808] rounded-lg flex items-center justify-center transition-colors duration-200">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.326 2.246c0-.136.11-.246.246-.246h2.18c.136 0 .246.11.246.246v15.508c0 2.13-1.728 3.858-3.858 3.858-2.13 0-3.858-1.728-3.858-3.858 0-2.13 1.728-3.858 3.858-3.858.136 0 .246.11.246.246v2.18c0 .136-.11.246-.246.246-1.012 0-1.832.82-1.832 1.832 0 1.012.82 1.832 1.832 1.832 1.012 0 1.832-.82 1.832-1.832V2.246z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/listings', label: 'All Listings' },
                { to: '/properties-for-rent', label: 'Properties For Rent' },
                { to: '/about', label: 'About Us' },
                { to: '/meet-the-team', label: 'Meet The Team' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Property Types</h4>
            <ul className="space-y-2.5">
              {['Apartments', 'Bedsitters', 'Rentals', 'Airbnb', 'Show Room House'].map(type => (
                <li key={type}>
                  <Link to={`/listings?type=${encodeURIComponent(type)}`}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={16} className="text-primary-500 mt-0.5 shrink-0" />
                Nairobi, Kenya
              </li>
              <li>
                <a href="tel:0119581321" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  <Phone size={16} className="text-primary-500 shrink-0" />
                  +254798641087
                </a>
              </li>
              <li>
                <a href="mailto:agencyrentease@gmail.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  <Mail size={16} className="text-primary-500 shrink-0" />
                  agencyrentease@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Rent Ease And Homes Agency. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}