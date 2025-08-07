'use client'

import { useState, useEffect } from 'react'
import { chatStorage } from '@/lib/storage'

interface BubbleNotificationProps {
  userPhone: string
  onNotificationClick?: (fromPhone: string) => void
}

interface NotificationBubble {
  id: string
  fromPhone: string
  senderName: string
  message: string
  timestamp: string
  isVisible: boolean
}

export function BubbleNotification({ userPhone, onNotificationClick }: BubbleNotificationProps) {
  const [notifications, setNotifications] = useState<NotificationBubble[]>([])

  const addNotification = (fromPhone: string, message: string, senderName: string) => {
    const newNotification: NotificationBubble = {
      id: `${fromPhone}_${Date.now()}`,
      fromPhone,
      senderName,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      timestamp: new Date().toISOString(),
      isVisible: true
    }

    console.log('🫧 Adding bubble notification:', newNotification)

    setNotifications(prev => {
      // Remove any existing notification from same sender
      const filtered = prev.filter(n => n.fromPhone !== fromPhone)
      return [...filtered, newNotification]
    })

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === newNotification.id 
            ? { ...n, isVisible: false }
            : n
        )
      )
      
      // Remove after fade out animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, 300)
    }, 5000)
  }

  const handleNotificationClick = (notification: NotificationBubble) => {
    console.log('🫧 Bubble notification clicked:', notification.fromPhone)
    
    // Mark messages as read
    chatStorage.updateConversationUnreadCount(userPhone, notification.fromPhone, false)
    
    // Remove this notification
    setNotifications(prev => prev.filter(n => n.id !== notification.id))
    
    // Trigger callback
    onNotificationClick?.(notification.fromPhone)
  }

  const dismissNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  // Expose method to add notifications
  useEffect(() => {
    // Store reference to add notification function globally
    (window as any).addBubbleNotification = addNotification
    
    return () => {
      delete (window as any).addBubbleNotification
    }
  }, [])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300 max-w-sm ${
            notification.isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full'
          }`}
        >
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {notification.senderName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.senderName}
                </h4>
                <button
                  onClick={(e) => dismissNotification(notification.id, e)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
          
          {/* New message indicator */}
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
