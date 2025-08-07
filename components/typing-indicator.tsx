'use client'

interface TypingIndicatorProps {
  typingUsers: Set<string>
  conversationName: string
}

export function TypingIndicator({ typingUsers, conversationName }: TypingIndicatorProps) {
  if (typingUsers.size === 0) return null

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>
        {typingUsers.size === 1 
          ? `${conversationName} is typing...`
          : `${typingUsers.size} people are typing...`
        }
      </span>
    </div>
  )
}
