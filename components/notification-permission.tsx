'use client'

import { useState, useEffect } from 'react'
import { notificationManager } from '@/lib/notifications'

export function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      if (Notification.permission === 'default') {
        setShowPrompt(true)
      }
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await notificationManager.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    setShowPrompt(false)
  }

  if (!showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm6 10V7a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h9a1 1 0 001-1z" />
        </svg>
        <span className="text-sm">Enable notifications to get alerts for new messages</span>
        <button
          onClick={handleRequestPermission}
          className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          Enable
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-blue-200 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
