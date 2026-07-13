import React from 'react';
import { motion } from 'framer-motion';

const SpecializationAnimation = ({ specialization, size = 40, className = '' }) => {
  const normalized = specialization?.toLowerCase().trim();

  // Common SVG container props
  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className
  };

  switch (normalized) {
    case 'cardiologist':
    case 'cardiology':
      return (
        <motion.svg {...svgProps} stroke="#ef4444"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          <path d="M12 9v4"></path>
          <path d="M10 11h4"></path>
        </motion.svg>
      );
    case 'neurologist':
    case 'neurology':
      return (
        <motion.svg {...svgProps} stroke="#8b5cf6"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path>
          <path d="M12 12c-2.2 0-4-1.8-4-4"></path>
          <path d="M12 12c2.2 0 4-1.8 4-4"></path>
          <path d="M12 12v4"></path>
          <path d="M10 18h4"></path>
        </motion.svg>
      );
    case 'orthopedic surgeon':
    case 'orthopedic':
      return (
        <motion.svg {...svgProps} stroke="#eab308"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M14 6L10 18"></path>
          <circle cx="16" cy="4" r="2"></circle>
          <circle cx="8" cy="20" r="2"></circle>
          <circle cx="8" cy="4" r="2"></circle>
          <circle cx="16" cy="20" r="2"></circle>
        </motion.svg>
      );
    case 'dentist':
      return (
        <motion.svg {...svgProps} stroke="#0ea5e9"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}>
          <path d="M12 20c-3 0-5-2-5-5V8c0-2 2-4 5-4s5 2 5 4v7c0 3-2 5-5 5z"></path>
          <path d="M12 20v-5"></path>
        </motion.svg>
      );
    case 'hepatologist':
    case 'hepatology':
      return (
        <motion.svg {...svgProps} stroke="#f43f5e"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M12 4C7 4 3 8 3 13c0 5 9 8 9 8s9-3 9-8c0-5-4-9-9-9z"></path>
          <path d="M12 4v4"></path>
          <path d="M12 8c2.5 0 4 1.5 4 4"></path>
        </motion.svg>
      );
    case 'ophthalmologist':
    case 'ophthalmology':
      return (
        <motion.svg {...svgProps} stroke="#10b981"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.05, 1] }}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </motion.svg>
      );
    default: // General Physician / Default Stethoscope
      return (
        <motion.svg {...svgProps} stroke="#3b82f6"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
          <circle cx="20" cy="10" r="2"></circle>
        </motion.svg>
      );
  }
};

export default SpecializationAnimation;
