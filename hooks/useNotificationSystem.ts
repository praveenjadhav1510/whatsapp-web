'use client'

import { useEffect, useState } from 'react'
import { useMessagePolling } from './useMessagePolling'
import { chatStorage } from '@/lib/storage'

interface UseNotificationSystemProps {
  userPhone: string
  selectedConversation: string | null
  isPageVisible: boolean
  onNewMessage?: (message: any) => void
  onConversationUpdate?: () => void
}

export function useNotificationSystem({
  userPhone,
  selectedConversation,
  isPageVisible,
  onNewMessage,
  onConversationUpdate
}: UseNotificationSystemProps) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)

  // Message polling hook
  const { isPolling, lastCheckTime, checkForNewMessages } = useMessagePolling({
    userPhone,
    isEnabled: !!userPhone,
    onNewMessage: (message) => {
      console.log('🔔 New message detected by polling:', message)
      
      // Don't show bubble notification if user is viewing this conversation
      const shouldShowBubble = selectedConversation !== message.from_phone
      
      if (shouldShowBubble) {
        // Add bubble notification
        const senderName = chatStorage.getContactName(userPhone, message.from_phone)
        
        // Use global function to add bubble notification
        if ((window as any).addBubbleNotification) {
          (window as any).addBubbleNotification(
            message.from_phone,
            message.message_text,
            senderName
          )
        }
      }
      
      // Update total unread count
      updateUnreadCount()
      
      // Trigger parent callbacks
      onNewMessage?.(message)
      onConversationUpdate?.()
    },
    onConversationUpdate,
    pollingInterval: 3000 // Check every 3 seconds
  })

  const updateUnreadCount = () => {
    if (!userPhone) return
    
    const total = chatStorage.getTotalUnreadCount(userPhone)
    setTotalUnreadCount(total)
    
    // Update browser tab title with unread count
    if (total > 0) {
      document.title = `(${total}) WhatsApp Web Clone`
    } else {
      document.title = 'WhatsApp Web Clone'
    }
  }

  // Update unread count when user or selected conversation changes
  useEffect(() => {
    updateUnreadCount()
  }, [userPhone, selectedConversation])

  // Update unread count periodically
  useEffect(() => {
    if (!userPhone) return
    
    const interval = setInterval(updateUnreadCount, 2000)
    return () => clearInterval(interval)
  }, [userPhone])

  // Manual check function
  const manualCheck = () => {
    console.log('🔄 Manual message check triggered')
    checkForNewMessages()
  }

  return {
    isPolling,
    lastCheckTime,
    totalUnreadCount,
    manualCheck,
    updateUnreadCount
  }
}
