import React, { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Activity, Calendar, FileText, Heart, UserPlus, FileSignature, Clock, CheckCircle, ChevronDown } from 'lucide-react'

// --- Animated Counter ---
const AnimatedCounter = ({ target, suffix = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  React.useEffect(() => {
    if (!inView) return
    let startTime = null
    const duration = 2000
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function FeaturesSection() {
  const features = [
    { icon: <Activity className="text-blue-400" />, title: 'AI Triage Assistant', desc: 'Get intelligent initial assessment before meeting a doctor.' },
    { icon: <Heart className="text-cyan-400" />, title: 'BMI Calculator', desc: 'Track your body metrics and stay on top of your health goals.' },
    { icon: <FileText className="text-teal-400" />, title: 'Health Dashboard', desc: 'All your health data visualized in one secure place.' },
    { icon: <Calendar className="text-blue-400" />, title: 'Online Appointment Booking', desc: 'Schedule visits instantly with top-rated specialists.' },
    { icon: <FileSignature className="text-purple-400" />, title: 'Digital Prescriptions', desc: 'Access your prescriptions anytime, anywhere.' },
    { icon: <FileText className="text-amber-400" />, title: 'Medical Reports', desc: 'Securely store and retrieve all your medical reports.' },
    { icon: <Clock className="text-cyan-400" />, title: 'Doctor Availability', desc: 'Real-time visibility into doctor schedules.' },
    { icon: <CheckCircle className="text-emerald-400" />, title: 'Secure Health Records', desc: 'Bank-level encryption for your sensitive health data.' },
  ]

  return (
    <section id="features" className="py-24 relative z-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Platform Features</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Experience the next generation of healthcare with our cutting-edge tools designed for both patients and doctors.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-[#0a1930]/50 backdrop-blur-md border border-white/[0.05] p-6 rounded-3xl hover:bg-[#0a1930]/80 hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgba(8,145,178,0.15)] transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.2)] transition-all duration-300">
                {feat.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DoctorsSection() {
  const doctors = [
    { name: 'Dr. Sarah Johnson', spec: 'Cardiologist', exp: '12 yrs', rating: '4.9', img: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Dr. Michael Chen', spec: 'Neurologist', exp: '15 yrs', rating: '4.8', img: 'https://i.pravatar.cc/150?u=michael' },
    { name: 'Dr. Emily Brown', spec: 'Dermatologist', exp: '8 yrs', rating: '5.0', img: 'https://i.pravatar.cc/150?u=emily' },
    { name: 'Dr. James Wilson', spec: 'Orthopedics', exp: '20 yrs', rating: '4.9', img: 'https://i.pravatar.cc/150?u=james' },
  ]

  return (
    <section id="doctors" className="py-24 relative z-10 px-4 bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Featured Doctors</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Connect with world-class specialists who are ready to provide exceptional care.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, i) => (
            <motion.div 
              key={doc.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-[#0a1930]/50 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="h-48 overflow-hidden">
                <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-1">{doc.name}</h3>
                <p className="text-sm text-blue-400 mb-3">{doc.spec}</p>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-6">
                  <span className="bg-white/5 px-2 py-1 rounded-md">{doc.exp} exp</span>
                  <span className="flex items-center text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">★ {doc.rating}</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/10 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:border-transparent text-white text-sm font-medium transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(8,145,178,0.4)] relative overflow-hidden">
                  <span className="relative z-10">Book Appointment</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsSection() {
  const stats = [
    { value: 15000, suffix: '+', label: 'Registered Patients' },
    { value: 500, suffix: '+', label: 'Expert Doctors' },
    { value: 50000, suffix: '+', label: 'Appointments Completed' },
    { value: 40, suffix: '+', label: 'Medical Specialties' },
  ]
  return (
    <section className="py-20 relative z-10 px-4 border-y border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    { name: 'Alice Walker', role: 'Patient', text: 'The AI Triage was surprisingly accurate and booking a cardiologist was seamless.' },
    { name: 'John Doe', role: 'Patient', text: 'Having all my medical records securely in one place gives me great peace of mind.' },
    { name: 'Sarah Lee', role: 'Patient', text: 'The interface is stunning and very easy to use. I love the digital prescriptions feature.' }
  ]
  return (
    <section className="py-24 relative z-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Patient Stories</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-2xl relative"
            >
              <div className="text-cyan-500/50 text-4xl absolute top-4 right-4">"</div>
              <p className="text-slate-300 mb-6 italic relative z-10">"{t.text}"</p>
              <div>
                <h4 className="text-white font-medium">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  const faqs = [
    { q: 'How does the AI Triage work?', a: 'Our AI Triage system asks you a series of clinical questions based on your symptoms to recommend the best specialty for your consultation.' },
    { q: 'Is my medical data secure?', a: 'Yes, we use bank-level AES-256 encryption to ensure all your health records and personal data remain strictly confidential.' },
    { q: 'Can I cancel an appointment?', a: 'Yes, you can cancel or reschedule appointments directly from your Patient Dashboard up to 24 hours before the scheduled time.' },
  ]
  const [open, setOpen] = useState(null)

  return (
    <section className="py-24 relative z-10 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-hidden">
            <button 
              className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-medium"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {faq.q}
              <ChevronDown className={`transform transition-transform ${open === i ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-48 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-slate-400 text-sm">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.05] py-12 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="text-blue-500" /> MediBook
          </h3>
          <p className="text-sm text-slate-400 max-w-sm">Intelligent healthcare management platform designed for the modern world. Your health, powered by AI.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#home" className="hover:text-cyan-400 transition-colors">Home</a></li>
            <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
            <li><a href="#doctors" className="hover:text-cyan-400 transition-colors">Find Doctors</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>support@medibook.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Health Ave, NY</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} MediBook. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
