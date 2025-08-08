'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/auth-provider'
import { LoginForm } from '@/components/login-form'
import { ConversationList } from '@/components/conversation-list'
import { EnhancedChatWindow } from '@/components/enhanced-chat-window'
import { ConnectionStatus } from '@/components/connection-status'
import { AddContactDialog } from '@/components/add-contact-dialog'
import { useSocket } from '@/hooks/useSocket'
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { chatStorage, StoredConversation, StoredMessage } from '@/lib/storage'
import { notificationManager } from '@/lib/notifications'

interface EnhancedMessage {
  _id: string
  from_phone: string
  to_phone: string
  message_text: string
  timestamp: string
  message_type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
}

interface Conversation {
  wa_id: string
  name: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function WhatsAppClone() {
  const { user, logout, isLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedConversationName, setSelectedConversationName] = useState<string>('')
  const [messages, setMessages] = useState<EnhancedMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showAddContactDialog, setShowAddContactDialog] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [convSearch, setConvSearch] = useState('')

  // Socket connection
  const { socket, isConnected, connectionAttempts } = useSocket(user?.phone)

  // Notification system with polling (manual button removed)
  const { isPolling, totalUnreadCount, updateUnreadCount } = useNotificationSystem({
    userPhone: user?.phone || '',
    selectedConversation,
    isPageVisible,
    onNewMessage: () => {
      loadConversationsFromStorage()
    },
    onConversationUpdate: () => {
      loadConversationsFromStorage()
    }
  })

  // Real-time messaging
  const { typingUsers, sendTypingIndicator, broadcastMessage } = useRealTimeMessages({
    socket,
    userPhone: user?.phone || '',
    selectedConversation,
    messages,
    setMessages,
    onNewMessage: (message) => {
      if (!user) return

      const incomingMessage = {
        ...message,
        status: 'delivered' as const
      }
      chatStorage.addMessage(user.phone, incomingMessage as StoredMessage)

      updateConversationWithNewMessage(message.from_phone, message.message_text, message.timestamp)

      if (selectedConversation !== message.from_phone) {
        const senderName = chatStorage.getContactName(user.phone, message.from_phone)
        notificationManager.showMessageNotification(
          senderName,
          message.message_text,
          message.from_phone,
          () => {
            window.focus()
            handleConversationSelect(message.from_phone)
          }
        )

        if ((window as any).addBubbleNotification) {
          ;(window as any).addBubbleNotification(
            message.from_phone,
            message.message_text,
            senderName
          )
        }
      }

      updateUnreadCount()
      loadConversationsFromStorage()
    },
    onConversationUpdate: () => {
      loadConversationsFromStorage()
    }
  })

  // Page visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden
      setIsPageVisible(newVisibility)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Request notification permission on load
  useEffect(() => {
    if (user) {
      notificationManager.requestPermission()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadConversationsFromStorage()
    }
  }, [user])

  const loadConversationsFromStorage = () => {
    if (!user) return

    const storedConversations = chatStorage.getConversations(user.phone)

    const displayConversations = storedConversations.map(conv => ({
      wa_id: conv.wa_id,
      name: conv.custom_name || conv.name,
      last_message: conv.last_message,
      last_message_time: conv.last_message_time,
      unread_count: conv.unread_count
    }))

    displayConversations.sort((a, b) =>
      new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    )

    setConversations(displayConversations)
  }

  const updateConversationWithNewMessage = (fromPhone: string, messageText: string, timestamp: string) => {
    if (!user) return

    const storedConversations = chatStorage.getConversations(user.phone)
    const contactName = chatStorage.getContactName(user.phone, fromPhone)

    const existingIndex = storedConversations.findIndex(conv => conv.wa_id === fromPhone)
    const currentUnreadCount = chatStorage.calculateUnreadCount(user.phone, fromPhone)

    const updatedConv: StoredConversation = {
      wa_id: fromPhone,
      name: contactName,
      last_message: messageText,
      last_message_time: timestamp,
      unread_count: currentUnreadCount
    }

    if (existingIndex >= 0) {
      storedConversations[existingIndex] = { ...storedConversations[existingIndex], ...updatedConv }
    } else {
      storedConversations.unshift(updatedConv)
    }

    chatStorage.saveConversations(user.phone, storedConversations)
    loadConversationsFromStorage()
  }

  const fetchMessages = async (otherUserPhone: string) => {
    if (!user) return

    try {
      const storedMessages = chatStorage.getMessages(user.phone, otherUserPhone)
      setMessages(storedMessages as EnhancedMessage[])

      if (storedMessages.length > 0) {
        const latestMessage = storedMessages[storedMessages.length - 1]
        updateConversationWithLatestMessage(otherUserPhone, latestMessage.message_text, latestMessage.timestamp)
      }

      const response = await fetch('/api/messages/between', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: user.phone,
          user2: otherUserPhone
        })
      })

      if (response.ok) {
        const apiMessages = await response.json()
        if (apiMessages.length > 0) {
          const allMessages = [...storedMessages, ...apiMessages]
          const uniqueMessages = allMessages.filter((msg, index, self) =>
            index === self.findIndex(m => m._id === msg._id)
          )
          uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

          setMessages(uniqueMessages as EnhancedMessage[])
          chatStorage.saveMessages(user.phone, otherUserPhone, uniqueMessages as StoredMessage[])

          if (uniqueMessages.length > 0) {
            const latestMessage = uniqueMessages[uniqueMessages.length - 1]
            updateConversationWithLatestMessage(otherUserPhone, latestMessage.message_text, latestMessage.timestamp)
          }
        }
      }

      markConversationAsRead(otherUserPhone)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markConversationAsRead = (otherUserPhone: string) => {
    if (!user) return

    chatStorage.updateConversationUnreadCount(user.phone, otherUserPhone, false)
    updateUnreadCount()
    loadConversationsFromStorage()
  }

  const handleConversationSelect = (waId: string) => {
    setSelectedConversation(waId)

    const contactName = chatStorage.getContactName(user?.phone || '', waId)
    setSelectedConversationName(contactName)

    fetchMessages(waId)
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !user || sendingMessage) return

    setSendingMessage(true)

    const optimisticMessage: EnhancedMessage = {
      _id: `temp_${Date.now()}`,
      from_phone: user.phone,
      to_phone: selectedConversation,
      message_text: text,
      timestamp: new Date().toISOString(),
      message_type: 'outgoing',
      status: 'sent',
      sender_name: user.name
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_phone: user.phone,
          to_phone: selectedConversation,
          message_text: text,
          sender_name: user.name
        })
      })

      if (response.ok) {
        const savedMessage = await response.json()

        setMessages(prev =>
          prev.map(msg =>
            msg._id === optimisticMessage._id ? savedMessage : msg
          )
        )

        chatStorage.addMessage(user.phone, savedMessage as StoredMessage)
        broadcastMessage(savedMessage)
        updateConversationInStorage(selectedConversation, text, savedMessage.timestamp)
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id))
    } finally {
      setSendingMessage(false)
    }
  }

  const updateConversationInStorage = (otherPhone: string, lastMessage: string, timestamp: string) => {
    if (!user) return

    const storedConversations = chatStorage.getConversations(user.phone)
    const contactName = chatStorage.getContactName(user.phone, otherPhone)

    const existingIndex = storedConversations.findIndex(conv => conv.wa_id === otherPhone)
    const updatedConv: StoredConversation = {
      wa_id: otherPhone,
      name: contactName,
      last_message: lastMessage,
      last_message_time: timestamp,
      unread_count: 0
    }

    if (existingIndex >= 0) {
      storedConversations[existingIndex] = { ...storedConversations[existingIndex], ...updatedConv }
    } else {
      storedConversations.unshift(updatedConv)
    }

    chatStorage.saveConversations(user.phone, storedConversations)
    loadConversationsFromStorage()
  }

  const handleAddContact = (phone: string, name: string) => {
    if (!user) return

    chatStorage.saveContact(user.phone, {
      phone,
      name,
      custom_name: name,
      added_at: new Date().toISOString()
    })

    const storedConversations = chatStorage.getConversations(user.phone)
    const existingConv = storedConversations.find(conv => conv.wa_id === phone)

    if (!existingConv) {
      const newConv: StoredConversation = {
        wa_id: phone,
        name: name,
        last_message: '',
        last_message_time: new Date().toISOString(),
        unread_count: 0
      }
      storedConversations.unshift(newConv)
      chatStorage.saveConversations(user.phone, storedConversations)
    }

    loadConversationsFromStorage()
    setSelectedConversation(phone)
    setSelectedConversationName(name)
    setMessages([])
  }

  const updateConversationWithLatestMessage = (otherPhone: string, messageText: string, timestamp: string) => {
    if (!user) return

    const storedConversations = chatStorage.getConversations(user.phone)
    const contactName = chatStorage.getContactName(user.phone, otherPhone)

    const existingIndex = storedConversations.findIndex(conv => conv.wa_id === otherPhone)
    const currentUnreadCount = chatStorage.calculateUnreadCount(user.phone, otherPhone)

    const updatedConv: StoredConversation = {
      wa_id: otherPhone,
      name: contactName,
      last_message: messageText,
      last_message_time: timestamp,
      unread_count: currentUnreadCount
    }

    if (existingIndex >= 0) {
      storedConversations[existingIndex] = { ...storedConversations[existingIndex], ...updatedConv }
    } else {
      storedConversations.unshift(updatedConv)
    }

    chatStorage.saveConversations(user.phone, storedConversations)
    loadConversationsFromStorage()
  }

  // Derived: filtered conversations by convSearch
  const filteredConversations = useMemo(() => {
    const q = convSearch.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(c => {
      const name = c.name?.toLowerCase() || ''
      const phone = c.wa_id?.toLowerCase() || ''
      const preview = c.last_message?.toLowerCase() || ''
      return name.includes(q) || phone.includes(q) || preview.includes(q)
    })
  }, [convSearch, conversations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatsApp Web...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ConnectionStatus isConnected={isConnected} connectionAttempts={connectionAttempts} />

      {/* Sidebar */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-800">WhatsApp Web</h1>
              {totalUnreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </div>
              )}
              {isPolling && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Checking for new messages..."></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.name}</span>
              {/* Removed manual refresh button */}
              <button
                onClick={logout}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
              >
                Logout
              </button>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Logged in as: +{user.phone}
          </div>
        </div>

        {/* Search and New Chat */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search conversations"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Search conversations"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => setShowAddContactDialog(true)}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Add new contact"
              aria-label="Add new contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading conversations...</p>
            </div>
          </div>
        ) : (
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
          />
        )}
      </div>

      {/* Chat Window */}
      <div className={`flex-1 ${selectedConversation ? 'block' : 'hidden md:block'}`}>
        <EnhancedChatWindow
          conversation={selectedConversation ? {
            wa_id: selectedConversation,
            name: selectedConversationName,
            last_message: '',
            last_message_time: '',
            unread_count: 0
          } : undefined}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedConversation(null)}
          sendingMessage={sendingMessage}
          typingUsers={typingUsers}
          onTypingStart={() => sendTypingIndicator(true)}
          onTypingStop={() => sendTypingIndicator(false)}
        />
      </div>

      {/* Add Contact Dialog */}
      <AddContactDialog
        isOpen={showAddContactDialog}
        onClose={() => setShowAddContactDialog(false)}
        onAddContact={handleAddContact}
      />
    </div>
  )
}
