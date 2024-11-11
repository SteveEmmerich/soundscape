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
        className="text-5xl font-extrabold mb-4 gradient-text"
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
    </motion.div>
  )
}