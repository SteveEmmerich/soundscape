'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PageTitleProps {
  children: React.ReactNode
  subtitle?: string
}

export function PageTitle({ children, subtitle }: PageTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <motion.h1 
        className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent"
        style={{
          backgroundImage: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--primary) 100%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
          animation: 'gradientAnimation 5s ease-in-out infinite',
        }}
      >
        {children}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
      <style jsx global>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  )
}