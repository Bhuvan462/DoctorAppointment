import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import { Activity, Heart, ShieldCheck, Stethoscope, Users, Calendar } from 'lucide-react'
import gsap from 'gsap'

export default function HeroSection({ heroRef }) {
  const { user, isAuthenticated } = useAuth()
  const dashboardRef = useRef(null)
  
  const getBookAppointmentLink = () => {
    if (!isAuthenticated) return '/register'
    return user?.role === ROLES.PATIENT ? '/patient/find-doctors' : `/${user?.role}/dashboard`
  }

  useEffect(() => {
    // GSAP animations for the right-side dashboard elements
    const ctx = gsap.context(() => {
      // Staggered entrance for floating cards
      gsap.fromTo('.float-card', 
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", delay: 0.3 }
      )
      
      // Floating animation for cards
      gsap.to('.float-card', {
        y: "-=15",
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { amount: 1.5, from: "random" }
      })

      // SVG ECG Animation
      gsap.to('.ecg-line', {
        strokeDashoffset: 0,
        duration: 2,
        ease: "none",
        repeat: -1
      })
    }, dashboardRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative z-10 min-h-screen flex items-center px-4 pt-24 pb-12 overflow-hidden hero-section">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Text Content (Left Side) */}
        <motion.div 
          className="flex-1 text-center lg:text-left z-10 hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-cyan-400 text-sm font-medium tracking-wide">
              Next-Generation Medical Platform
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            <span className="text-white">Your Health,</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              Powered by AI
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-300 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed font-light"
          >
            Book appointments, receive AI-powered health guidance, manage your records, and connect with trusted specialists through one modern platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to={getBookAppointmentLink()}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-base shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Book Appointment
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-base backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Medical Dashboard (Right Side) */}
        <div ref={dashboardRef} className="flex-1 w-full relative h-[500px] lg:h-[600px] pointer-events-none mt-12 lg:mt-0">
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[100px] rounded-full opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-cyan-400/20 blur-[80px] rounded-full opacity-40" />

          {/* Main Central Card */}
          <div className="float-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0a1930]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-slate-400 text-sm font-medium tracking-wider">LIVE VITALS</h3>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-4xl font-bold text-white">72</span>
                  <span className="text-cyan-400 text-sm font-semibold mb-1">BPM</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Heart className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
            </div>
            
            {/* Animated ECG SVG */}
            <div className="w-full h-24 bg-black/20 rounded-xl p-2 relative overflow-hidden border border-white/5">
              <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                {/* Background grid lines could go here */}
                <path 
                  className="ecg-line stroke-cyan-400" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  d="M 0 20 L 40 20 L 50 10 L 60 35 L 70 5 L 80 20 L 200 20" 
                />
              </svg>
            </div>
          </div>

          {/* Floating Card 1: AI Insights */}
          <div className="float-card absolute top-[10%] -left-[5%] md:left-[5%] w-64 bg-[#0a1930]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(8,145,178,0.2)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">AI Health Analysis</h4>
                <p className="text-cyan-300 text-xs mt-1">All systems nominal.</p>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[98%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card 2: Appointments */}
          <div className="float-card absolute bottom-[15%] -right-[5%] md:right-[5%] w-56 bg-[#0a1930]/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(168,85,247,0.2)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Appointments</p>
                <h4 className="text-white font-bold text-xl mt-0.5">14 Today</h4>
              </div>
            </div>
          </div>

          {/* Floating Icon 1 */}
          <div className="float-card absolute top-[20%] right-[10%] w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-blue-400" />
          </div>

          {/* Floating Icon 2 */}
          <div className="float-card absolute bottom-[25%] left-[10%] w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>

        </div>
      </div>
    </section>
  )
}
