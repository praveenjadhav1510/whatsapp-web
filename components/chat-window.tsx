'use client'

import { useState, useEffect, useRef } from 'react'
import { Conversation, Message } from '@/types'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { TypingIndicator } from './typing-indicator'

interface ChatWindowProps {
  conversation?: Conversation
  messages: Message[]
  onSendMessage: (text: string) => void
  onBack: () => void
  sendingMessage?: boolean
  typingUsers?: Set<string>
  onTypingStart?: () => void
  onTypingStop?: () => void
}

export function ChatWindow({ 
  conversation, 
  messages, 
  onSendMessage, 
  onBack,
  sendingMessage = false,
  typingUsers = new Set(),
  onTypingStart,
  onTypingStop
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 opacity-20">
            <svg viewBox="0 0 303 172" className="w-full h-full">
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center">
        {/* Back button for mobile */}
        <button
          onClick={onBack}
          className="md:hidden mr-3 p-1 hover:bg-gray-200 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Profile Picture */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
          {conversation.profile_picture ? (
            <img
              src={conversation.profile_picture || "/placeholder.svg"}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold">
              {conversation.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
          <p className="text-sm text-gray-500">
            {typingUsers.size > 0 ? (
              <span className="text-green-600">
                {typingUsers.size === 1 ? 'typing...' : `${typingUsers.size} people typing...`}
              </span>
            ) : (
              conversation.wa_id.startsWith('+') ? conversation.wa_id : `+${conversation.wa_id}`
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
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
      <MessageInput 
        onSendMessage={onSendMessage} 
        disabled={sendingMessage}
        placeholder={sendingMessage ? "Sending..." : "Type a message"}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  )
}
