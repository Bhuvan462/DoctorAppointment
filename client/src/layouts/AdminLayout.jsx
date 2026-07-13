import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import AuroraBackground from '../components/common/AuroraBackground'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#06122b] relative">
      {/* Aurora background */}
      <AuroraBackground intensity="subtle" />

      {/* Navbar */}
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <motion.main
        className="relative z-10 pt-16 lg:pl-56 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 sm:p-8 lg:p-10 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

export default AdminLayout