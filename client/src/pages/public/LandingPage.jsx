import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingNavbar from '../../components/landing/LandingNavbar'
import HeroSection from '../../components/landing/HeroSection'
import { 
  FeaturesSection, 
  DoctorsSection, 
  StatsSection, 
  TestimonialsSection, 
  FAQSection, 
  LandingFooter 
} from '../../components/landing/LandingSections'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const containerRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade out hero content when scrolling down for a smooth parallax effect
      if (heroRef.current) {
        gsap.to('.hero-content', {
          y: -100,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-[#071A3D] overflow-x-hidden selection:bg-cyan-500/30 font-sans"
    >
      <LandingNavbar />
      
      <main>
        <HeroSection heroRef={heroRef} />
        
        <div className="relative z-10 bg-gradient-to-b from-transparent to-[#051126]">
          <FeaturesSection />
          <StatsSection />
          <DoctorsSection />
          <TestimonialsSection />
          <FAQSection />
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}