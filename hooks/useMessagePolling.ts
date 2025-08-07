'use client'

import { useEffect, useRef, useState } from 'react'
import { chatStorage, StoredMessage } from '@/lib/storage'
import { notificationManager } from '@/lib/notifications'

interface PollingMessage {
  _id: string
  from_phone: string
  to_phone: string
  message_text: string
  timestamp: string
  message_type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
}

interface UseMessagePollingProps {
  userPhone: string
  isEnabled: boolean
  onNewMessage?: (message: PollingMessage) => void
  onConversationUpdate?: () => void
  pollingInterval?: number
}

export function useMessagePolling({
  userPhone,
  isEnabled,
  onNewMessage,
  onConversationUpdate,
  pollingInterval = 5000 // Check every 5 seconds
}: UseMessagePollingProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCountRef = useRef<Record<string, number>>({})

  const checkForNewMessages = async () => {
    if (!userPhone || !isEnabled) return

    try {
      console.log('🔍 Polling for new messages for user:', userPhone)
      setIsPolling(true)

      // Get all conversations to check for new messages
      const conversations = chatStorage.getConversations(userPhone)
      
      for (const conversation of conversations) {
        try {
          // Get current messages for this conversation
          const currentMessages = chatStorage.getMessages(userPhone, conversation.wa_id)
          const currentCount = currentMessages.length
          const lastKnownCount = lastMessageCountRef.current[conversation.wa_id] || 0

          // Check if there are new messages
          if (currentCount > lastKnownCount) {
            console.log(`📬 Found ${currentCount - lastKnownCount} new messages from ${conversation.name}`)
            
            // Get the new messages (messages added since last check)
            const newMessages = currentMessages.slice(lastKnownCount)
            
            // Process each new message
            for (const message of newMessages) {
              // Only process incoming messages that are newer than last check
              if (message.to_phone === userPhone && 
                  new Date(message.timestamp) > new Date(lastCheckTime)) {
                
                console.log('🔔 Processing new incoming message:', message.message_text.substring(0, 30))
                
                // Trigger callbacks
                onNewMessage?.(message as PollingMessage)
                onConversationUpdate?.()
                
                // Show notification
                const senderName = chatStorage.getContactName(userPhone, message.from_phone)
                notificationManager.showMessageNotification(
                  senderName,
                  message.message_text,
                  message.from_phone,
                  () => {
                    // Focus window when notification is clicked
                    window.focus()
                  }
                )
              }
            }
          }

          // Update the last known count
          lastMessageCountRef.current[conversation.wa_id] = currentCount

        } catch (error) {
          console.error(`Error checking messages for ${conversation.wa_id}:`, error)
        }
      }

      // Also check API for any server-side messages
      await checkAPIForNewMessages()

      setLastCheckTime(new Date().toISOString())

    } catch (error) {
      console.error('Error in message polling:', error)
    } finally {
      setIsPolling(false)
    }
  }

  const checkAPIForNewMessages = async () => {
    try {
      // Check if we have MongoDB connection
      if (!process.env.MONGODB_URI) return

      const response = await fetch(`/api/conversations/${userPhone}`)
      if (response.ok) {
        const serverConversations = await response.json()
        
        // Compare with local storage and sync any differences
        for (const serverConv of serverConversations) {
          const localMessages = chatStorage.getMessages(userPhone, serverConv.wa_id)
          
          // Fetch messages from server for this conversation
          const messagesResponse = await fetch('/api/messages/between', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user1: userPhone,
              user2: serverConv.wa_id
            })
          })

          if (messagesResponse.ok) {
            const serverMessages = await messagesResponse.json()
            
            // Find messages that exist on server but not locally
            const newServerMessages = serverMessages.filter((serverMsg: any) => 
              !localMessages.some(localMsg => localMsg._id === serverMsg._id)
            )

            // Add new server messages to local storage
            for (const newMsg of newServerMessages) {
              if (newMsg.to_phone === userPhone) {
                console.log('📥 Syncing new message from server:', newMsg.message_text.substring(0, 30))
                chatStorage.addMessage(userPhone, newMsg as StoredMessage)
                
                // Trigger notification for server-synced message
                onNewMessage?.(newMsg as PollingMessage)
                
                const senderName = chatStorage.getContactName(userPhone, newMsg.from_phone)
                notificationManager.showMessageNotification(
                  senderName,
                  newMsg.message_text,
                  newMsg.from_phone
                )
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking API for new messages:', error)
    }
  }

  // Start/stop polling based on isEnabled
  useEffect(() => {
    if (isEnabled && userPhone) {
      console.log('🔄 Starting message polling for user:', userPhone)
      
      // Initial check
      checkForNewMessages()
      
      // Set up interval
      intervalRef.current = setInterval(checkForNewMessages, pollingInterval)
      
      return () => {
        if (intervalRef.current) {
          console.log('⏹️ Stopping message polling')
          clearInterval(intervalRef.current)
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEnabled, userPhone, pollingInterval])

  // Initialize message counts on first load
  useEffect(() => {
    if (userPhone) {
      const conversations = chatStorage.getConversations(userPhone)
      const initialCounts: Record<string, number> = {}
      
      conversations.forEach(conv => {
        const messages = chatStorage.getMessages(userPhone, conv.wa_id)
        initialCounts[conv.wa_id] = messages.length
      })
      
      lastMessageCountRef.current = initialCounts
      console.log('📊 Initialized message counts:', initialCounts)
    }
  }, [userPhone])

  return {
    isPolling,
    lastCheckTime,
    checkForNewMessages: () => checkForNewMessages()
  }
}
