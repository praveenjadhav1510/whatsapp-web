'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/components/auth-provider'
import { TypingIndicator } from '@/components/typing-indicator'

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

interface EnhancedChatWindowProps {
  conversation?: Conversation
  messages: EnhancedMessage[]
  onSendMessage: (text: string) => void
  onBack: () => void
  sendingMessage?: boolean
  typingUsers?: Set<string>
  onTypingStart?: () => void
  onTypingStop?: () => void
}

export function EnhancedChatWindow({
  conversation,
  messages,
  onSendMessage,
  onBack,
  sendingMessage = false,
  typingUsers = new Set(),
  onTypingStart,
  onTypingStop
}: EnhancedChatWindowProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)
  const { user } = useAuth()

  // Search state
  const [showSearch, setShowSearch] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const [matchIndexes, setMatchIndexes] = useState<number[]>([])
  const [currentMatch, setCurrentMatch] = useState(0)

  // Refs for each message to allow scrolling to match
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  // Compute match indexes when query or messages change
  useEffect(() => {
    if (!chatSearch.trim()) {
      setMatchIndexes([])
      setCurrentMatch(0)
      return
    }
    const q = chatSearch.toLowerCase()
    const idxs: number[] = []
    messages.forEach((m, idx) => {
      if ((m.message_text || '').toLowerCase().includes(q)) {
        idxs.push(idx)
      }
    })
    setMatchIndexes(idxs)
    setCurrentMatch(idxs.length > 0 ? 0 : 0)
  }, [chatSearch, messages])

  // Auto-scroll to current match
  useEffect(() => {
    if (matchIndexes.length === 0) return
    const msgIndex = matchIndexes[currentMatch] ?? matchIndexes[0]
    const msg = messages[msgIndex]
    if (msg && messageRefs.current[msg._id]) {
      messageRefs.current[msg._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentMatch, matchIndexes, messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Typing indicators
    if (value.trim() && !isTypingRef.current) {
      isTypingRef.current = true
      onTypingStart?.()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        onTypingStop?.()
      }
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && !sendingMessage) {
      onSendMessage(newMessage.trim())
      setNewMessage('')

      if (isTypingRef.current) {
        isTypingRef.current = false
        onTypingStop?.()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return 'Now'
    }
  }

  const getStatusIcon = (message: EnhancedMessage) => {
    if (message.from_phone !== user?.phone) return null

    switch (message.status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'read':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 opacity-20">
            <svg viewBox="0 0 303 172" className="w-full h-full" aria-hidden="true">
              <path fill="#DDD" d="M229.565 160.229c-6.429-.439-13.353-1.292-20.728-2.556l-1.5-5c0 0 0 0 0 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
          <p className="text-gray-500 max-w-md">
            Send and receive messages without keeping your phone online.
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
          <div className="mt-6 text-sm text-gray-400">
            <p>👈 Select a conversation to start messaging</p>
          </div>
        </div>
      </div>
    )
  }

  // Helpers for search highlight
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const q = query.toLowerCase()
    const lower = text.toLowerCase()
    const parts: Array<string | JSX.Element> = []
    let i = 0
    while (i < text.length) {
      const idx = lower.indexOf(q, i)
      if (idx === -1) {
        parts.push(text.slice(i))
        break
      }
      if (idx > i) parts.push(text.slice(i, idx))
      parts.push(
        <mark key={idx} className="bg-yellow-200 px-0.5 rounded">
          {text.slice(idx, idx + q.length)}
        </mark>
      )
      i = idx + q.length
    }
    return parts
  }

  const handleSearchToggle = () => {
    setShowSearch(prev => !prev)
    if (!showSearch) {
      // opening search: focus handled via autoFocus on input
    } else {
      // closing search
      setChatSearch('')
      setMatchIndexes([])
      setCurrentMatch(0)
    }
  }

  const goToNextMatch = () => {
    if (matchIndexes.length === 0) return
    setCurrentMatch(prev => (prev + 1) % matchIndexes.length)
  }

  const goToPrevMatch = () => {
    if (matchIndexes.length === 0) return
    setCurrentMatch(prev => (prev - 1 + matchIndexes.length) % matchIndexes.length)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      goToNextMatch()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleSearchToggle()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="p-4 flex items-center">
          {/* Back button for mobile */}
          <button
            onClick={onBack}
            className="md:hidden mr-3 p-1 hover:bg-gray-200 rounded"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Profile Picture */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <span className="text-gray-600 font-semibold">
              {conversation.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Contact Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{conversation.name}</h2>
            <p className="text-sm text-gray-500 truncate">
              {typingUsers.size > 0 ? (
                <span className="text-green-600">typing...</span>
              ) : (
                conversation.wa_id.startsWith('+') ? conversation.wa_id : `+${conversation.wa_id}`
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              className="p-2 hover:bg-gray-200 rounded-full"
              onClick={handleSearchToggle}
              aria-label={showSearch ? 'Close search' : 'Search in chat'}
              title={showSearch ? 'Close search' : 'Search in chat'}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-full" aria-label="More options">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* In-chat Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 p-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="flex-1 outline-none text-sm"
                placeholder="Search in chat"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                onKeyDown={onSearchKeyDown}
                autoFocus
                aria-label="Search in chat"
              />
              <div className="text-xs text-gray-600">
                {matchIndexes.length > 0 ? `${currentMatch + 1}/${matchIndexes.length}` : '0/0'}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={goToPrevMatch}
                  disabled={matchIndexes.length === 0}
                  aria-label="Previous match"
                  title="Previous match"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={goToNextMatch}
                  disabled={matchIndexes.length === 0}
                  aria-label="Next match"
                  title="Next match"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={handleSearchToggle}
                  aria-label="Close search"
                  title="Close search"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-messages">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => {
              const isOutgoing = message.from_phone === user?.phone
              const isMatch = chatSearch.trim().length > 0 &&
                (message.message_text || '').toLowerCase().includes(chatSearch.trim().toLowerCase())

              return (
                <div
                  key={message._id}
                  ref={(el) => { messageRefs.current[message._id] = el }}
                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg message-bubble ${
                      isOutgoing
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    } ${isMatch ? 'ring-2 ring-yellow-300' : ''}`}
                  >
                    {!isOutgoing && message.sender_name && (
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        {message.sender_name}
                      </p>
                    )}

                    <p className="text-sm whitespace-pre-wrap break-words">
                      {chatSearch.trim()
                        ? highlightText(message.message_text, chatSearch)
                        : message.message_text}
                    </p>

                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      isOutgoing ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                      {getStatusIcon(message)}
                    </div>
                  </div>
                </div>
              )
            })}
            {typingUsers.size > 0 && (
              <TypingIndicator
                typingUsers={typingUsers}
                conversationName={conversation.name}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-gray-100 p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
            aria-label="Emoji"
            title="Emoji"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder={sendingMessage ? "Sending..." : "Type a message"}
              disabled={sendingMessage}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              aria-label="Type a message"
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() && !sendingMessage
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Send message"
            title="Send"
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
