'use client'

import { Conversation } from '@/types'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onConversationSelect: (waId: string) => void
}

export function ConversationList({ 
  conversations, 
  selectedConversation, 
  onConversationSelect 
}: ConversationListProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      } else if (days === 1) {
        return 'Yesterday'
      } else if (days < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch (error) {
      return 'Now'
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium mb-2">No conversations yet</p>
          <p className="text-sm">Start a new conversation or check your database connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.wa_id}
          onClick={() => onConversationSelect(conversation.wa_id)}
          className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
            selectedConversation === conversation.wa_id ? 'bg-gray-100' : ''
          } ${conversation.unread_count > 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
        >
          {/* Profile Picture */}
          <div className="flex-shrink-0 mr-3 relative">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              {conversation.profile_picture ? (
                <img
                  src={conversation.profile_picture || "/placeholder.svg"}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold text-lg">
                  {conversation.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Unread count badge on profile picture */}
            {conversation.unread_count > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                </span>
              </div>
            )}
          </div>

          {/* Conversation Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm truncate ${
                conversation.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'
              }`}>
                {conversation.name}
              </h3>
              <span className={`text-xs flex-shrink-0 ml-2 ${
                conversation.unread_count > 0 ? 'text-green-600 font-semibold' : 'text-gray-500'
              }`}>
                {formatTime(conversation.last_message_time)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-sm truncate ${
                conversation.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'
              }`}>
                {conversation.last_message || 'No messages yet'}
              </p>
              {conversation.unread_count > 0 && (
                <div className="flex items-center ml-2">
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0 min-w-[20px] text-center font-bold">
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
