import { BrowserRouter, Routes, Route, ScrollRestoration, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './context/AuthContext'

import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import PropertiesForRentPage from './pages/PropertiesForRentPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import MeetTheTeamPage from './pages/MeetTheTeamPage'
import FavoritesPage from './pages/FavoritesPage'
import ComparePage from './pages/ComparePage'
import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AdminRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-50" />
  return user?.is_admin ? <Navigate to="/admin" replace /> : <HomePage />
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<AdminRedirect />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/properties-for-rent" element={<PropertiesForRentPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/meet-the-team" element={<MeetTheTeamPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <div className="pt-32 pb-20 text-center">
                  <div className="text-7xl mb-5">🏚️</div>
                  <h1 className="text-3xl font-bold font-display text-slate-900 mb-3">Page Not Found</h1>
                  <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
