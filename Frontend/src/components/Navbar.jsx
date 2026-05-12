import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Home, List, Building2, Users, Info, Phone, ChevronDown, LogOut, Heart, GitCompare, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthModal from './AuthModal'
import logo from '../../public/rentease-logo.png'

const navItems = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/listings', label: 'Listings', icon: List },
  { to: '/properties-for-rent', label: 'Properties For Rent', icon: Building2 },
  { to: '/meet-the-team', label: 'About', icon: Users },
  { to: '/about', label: 'Meet the team', icon: Info },
  { to: '/contact', label: 'Contact', icon: Phone },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal, setAuthModal] = useState(null) // 'login' | 'register' | null
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [navigate])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    toast.show('You have been signed out.', 'info')
    navigate('/')
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src={logo} alt="RentEase and Homes Agency Logo" className="w-12 h-12 object-contain" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[#D01010] leading-tight font-display">RentEase</p>
                <p className="text-xs text-[#F85018] leading-tight font-semibold tracking-wide uppercase">and Homes Agency</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ to, label, exact }) => (
                <NavLink key={to} to={to} end={exact}
                  className={({ isActive }) =>
                    `nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
                    }`
                  }>
                  {label}
                </NavLink>
              ))}
              {user?.is_admin && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
                    }`
                  }>
                  Admin
                </NavLink>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Phone */}
              <a href="tel:  +254798641087" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                <span className="text-xs">📞</span>
                 +254798641087
              </a>

              {/* Auth */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-2 rounded-lg transition-colors">
                    <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.username[0].toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate">{user.username}</span>
                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.username}</p>
                      </div>
                      <Link to="/favorites" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Heart size={15} className="text-rose-500" />
                        Saved Homes
                      </Link>
                      <Link to="/compare" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <GitCompare size={15} className="text-blue-500" />
                        Compare
                      </Link>
                      {user.is_admin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <span className="text-purple-600">⚙️</span>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => setAuthModal('login')} className="btn-ghost text-sm font-semibold">
                    Sign In
                  </button>
                  <button onClick={() => setAuthModal('register')} className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <NavLink key={to} to={to} end={exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }>
                <Icon size={17} />
                {label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-slate-100 mt-3">
              <a href="tel:0119581321" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50">
                <span>📞</span> 0119581321
              </a>
              {!user && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { setAuthModal('login'); setMobileOpen(false) }}
                    className="flex-1 btn-secondary py-2 text-sm">Sign In</button>
                  <button onClick={() => { setAuthModal('register'); setMobileOpen(false) }}
                    className="flex-1 btn-primary py-2 text-sm">Sign Up</button>
                </div>
              )}
              {user?.is_admin && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive ? 'text-primary-700 bg-primary-50' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }>
                  <span>⚙️</span>
                  Admin Dashboard
                </NavLink>
              )}
              {user && (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl mt-1 font-medium">
                  <LogOut size={16} />
                  Sign Out ({user.username})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}
    </>
  )
}
