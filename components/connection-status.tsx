'use client'

import { useState, useEffect } from 'react'

interface ConnectionStatusProps {
  isConnected: boolean
  connectionAttempts?: number
}

export function ConnectionStatus({ isConnected, connectionAttempts = 0 }: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show status briefly when first connecting successfully
    if (isConnected && connectionAttempts === 0) {
      setIsVisible(true)
      setShowStatus(true)
      
      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setShowStatus(false), 300) // Wait for fade out
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, connectionAttempts])

  // Don't show anything for disconnected or reconnecting states
  if (!showStatus || !isConnected) return null

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 bg-green-100 text-green-800 border-green-200 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium">Connected</span>
      </div>
    </div>
  )
}
