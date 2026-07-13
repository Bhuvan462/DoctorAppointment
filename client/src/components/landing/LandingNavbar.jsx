import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../common/Logo'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user } = useAuth()
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Find Doctors', href: '#doctors' },
    { name: 'AI Triage', href: '/triage' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ]

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login'
    return `/${user?.role}/dashboard`
  }

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#06122b]/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Logo size="sm" showText={true} linkTo="/" />
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            link.href.startsWith('/') ? (
              <Link key={link.name} to={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.name}
              </Link>
            ) : (
              <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.name}
              </a>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to={isAuthenticated ? getDashboardLink() : "/login"}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:text-blue-300 transition-all text-sm font-semibold"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
