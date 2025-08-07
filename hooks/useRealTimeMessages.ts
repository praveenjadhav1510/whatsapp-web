'use client'

import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'

interface Message {
  _id: string
  from_phone: string
  to_phone: string
  message_text: string
  timestamp: string
  message_type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
}

interface UseRealTimeMessagesProps {
  socket: Socket | null
  userPhone: string
  selectedConversation: string | null
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onNewMessage?: (message: Message) => void
  onConversationUpdate?: () => void
}

export function useRealTimeMessages({
  socket,
  userPhone,
  selectedConversation,
  messages,
  setMessages,
  onNewMessage,
  onConversationUpdate
}: UseRealTimeMessagesProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!socket || !userPhone) return

    console.log('🔌 Setting up real-time message listeners for user:', userPhone)

    // Listen for new messages directed to this user
    const handleNewMessage = (message: Message) => {
      console.log('📨 Received new message via socket:', message)
      console.log('👤 Message from:', message.from_phone, 'to:', message.to_phone)
      console.log('🎯 Current user:', userPhone)
      console.log('💬 Selected conversation:', selectedConversation)
      
      // Check if message is for current user (incoming message)
      if (message.to_phone === userPhone) {
        console.log('✅ Message is for current user, processing...')
        
        // If viewing the conversation, add to messages immediately
        if (selectedConversation === message.from_phone) {
          console.log('📱 Adding message to current conversation view')
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === message._id)
            if (exists) {
              console.log('⚠️ Message already exists, skipping')
              return prev
            }
            console.log('➕ Adding new message to conversation')
            return [...prev, message]
          })
        } else {
          console.log('📋 Message is for different conversation, updating conversation list only')
        }
        
        // Always trigger conversation update and notification
        console.log('🔔 Triggering notification and conversation update')
        onConversationUpdate?.()
        onNewMessage?.(message)
      } else if (message.from_phone === userPhone) {
        console.log('📤 This is a message sent by current user from another session')
        // Handle messages sent by current user from other sessions
        if (selectedConversation === message.to_phone) {
          console.log('📱 Adding sent message to current conversation view')
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === message._id)
            if (exists) return prev
            return [...prev, message]
          })
        }
        onConversationUpdate?.()
      } else {
        console.log('❌ Message not relevant to current user')
      }
    }

    // Listen for messages sent from other sessions of same user
    const handleMessageSent = (message: Message) => {
      console.log('📤 Message sent from another session:', message)
      
      // If viewing the conversation where message was sent, add it
      if (message.from_phone === userPhone && selectedConversation === message.to_phone) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === message._id)
          if (exists) return prev
          return [...prev, message]
        })
      }
      
      onConversationUpdate?.()
    }

    // Listen for typing indicators
    const handleUserTyping = (data: { from_phone: string; to_phone: string; isTyping: boolean }) => {
      console.log('⌨️ Typing indicator received:', data)
      if (data.to_phone === userPhone && data.from_phone === selectedConversation) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.from_phone)
          } else {
            newSet.delete(data.from_phone)
          }
          return newSet
        })
      }
    }

    // Listen for message status updates
    const handleStatusUpdate = (data: { messageId: string; from_phone: string; to_phone: string; status: string }) => {
      if ((data.from_phone === userPhone && data.to_phone === selectedConversation) ||
          (data.to_phone === userPhone && data.from_phone === selectedConversation)) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === data.messageId
              ? { ...msg, status: data.status as Message['status'] }
              : msg
          )
        )
      }
    }

    // Set up event listeners
    socket.on('new-message', handleNewMessage)
    socket.on('message-sent', handleMessageSent)
    socket.on('user-typing', handleUserTyping)
    socket.on('message-status-changed', handleStatusUpdate)

    // Join user room when socket connects
    console.log('🏠 Joining user room:', userPhone)
    socket.emit('join-user', userPhone)

    return () => {
      console.log('🧹 Cleaning up real-time message listeners')
      socket.off('new-message', handleNewMessage)
      socket.off('message-sent', handleMessageSent)
      socket.off('user-typing', handleUserTyping)
      socket.off('message-status-changed', handleStatusUpdate)
    }
  }, [socket, userPhone, selectedConversation, setMessages, onNewMessage, onConversationUpdate])

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket && selectedConversation) {
      console.log('⌨️ Sending typing indicator:', isTyping, 'to', selectedConversation)
      socket.emit(isTyping ? 'typing-start' : 'typing-stop', {
        from_phone: userPhone,
        to_phone: selectedConversation
      })
    }
  }

  const broadcastMessage = (message: Message) => {
    if (socket) {
      console.log('📡 Broadcasting message via socket:', message)
      socket.emit('send-message', message)
    }
  }

  return { 
    typingUsers, 
    sendTypingIndicator, 
    broadcastMessage 
  }
}
