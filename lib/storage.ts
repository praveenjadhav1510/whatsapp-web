// Client-side storage management for chat persistence
export interface StoredConversation {
  wa_id: string
  name: string
  last_message: string
  last_message_time: string
  unread_count: number
  custom_name?: string
}

export interface StoredMessage {
  _id: string
  from_phone: string
  to_phone: string
  message_text: string
  timestamp: string
  message_type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
}

export interface StoredContact {
  phone: string
  name: string
  custom_name?: string
  added_at: string
}

class ChatStorage {
  private getStorageKey(userPhone: string, type: 'conversations' | 'messages' | 'contacts'): string {
    return `whatsapp_${type}_${userPhone}`
  }

  // Calculate unread count by counting unread messages
  calculateUnreadCount(userPhone: string, otherPhone: string): number {
    const messages = this.getMessages(userPhone, otherPhone)
    
    // Count incoming messages that are not read
    const unreadCount = messages.filter(msg => 
      msg.to_phone === userPhone && // Message is TO current user (incoming)
      msg.status !== 'read' // Message is not read
    ).length
    
    console.log(`📊 Calculated unread count for ${otherPhone}:`, unreadCount)
    return unreadCount
  }

  // Mark messages as read
  markMessagesAsRead(userPhone: string, otherPhone: string): void {
    const messages = this.getMessages(userPhone, otherPhone)
    
    // Mark all incoming messages as read
    const updatedMessages = messages.map(msg => {
      if (msg.to_phone === userPhone && msg.status !== 'read') {
        console.log('✅ Marking message as read:', msg.message_text.substring(0, 30))
        return { ...msg, status: 'read' as const }
      }
      return msg
    })
    
    this.saveMessages(userPhone, otherPhone, updatedMessages)
  }

  // Conversations
  saveConversations(userPhone: string, conversations: StoredConversation[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.getStorageKey(userPhone, 'conversations'), JSON.stringify(conversations))
    console.log('💾 Saved conversations to storage:', conversations.map(c => ({ name: c.name, unread: c.unread_count })))
  }

  getConversations(userPhone: string): StoredConversation[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.getStorageKey(userPhone, 'conversations'))
    const conversations = stored ? JSON.parse(stored) : []
    
    // Recalculate unread counts and update last messages based on actual messages
    const updatedConversations = conversations.map((conv: StoredConversation) => {
      const messages = this.getMessages(userPhone, conv.wa_id)
      const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null
      
      return {
        ...conv,
        unread_count: this.calculateUnreadCount(userPhone, conv.wa_id),
        last_message: latestMessage ? latestMessage.message_text : conv.last_message || 'No messages yet',
        last_message_time: latestMessage ? latestMessage.timestamp : conv.last_message_time
      }
    })
    
    console.log('📖 Retrieved conversations from storage:', updatedConversations.map((c: StoredConversation) => ({ 
      name: c.name, 
      unread: c.unread_count,
      lastMsg: c.last_message.substring(0, 30)
    })))
    return updatedConversations
  }

  updateConversationUnreadCount(userPhone: string, otherPhone: string, increment: boolean = true): void {
    if (typeof window === 'undefined') return
    
    console.log(`🔔 ${increment ? 'Incrementing' : 'Clearing'} unread count for:`, otherPhone)
    
    if (!increment) {
      // Mark messages as read when clearing unread count
      this.markMessagesAsRead(userPhone, otherPhone)
    }
    
    const conversations = this.getConversations(userPhone)
    const updatedConversations = conversations.map(conv => {
      if (conv.wa_id === otherPhone) {
        const newCount = increment ? this.calculateUnreadCount(userPhone, otherPhone) : 0
        console.log(`📊 Updated unread count for ${conv.name}: ${conv.unread_count} → ${newCount}`)
        return {
          ...conv,
          unread_count: newCount
        }
      }
      return conv
    })
    
    this.saveConversations(userPhone, updatedConversations)
  }

  getTotalUnreadCount(userPhone: string): number {
    const conversations = this.getConversations(userPhone)
    const total = conversations.reduce((total, conv) => total + conv.unread_count, 0)
    console.log('📊 Total unread count:', total)
    return total
  }

  // Messages
  saveMessages(userPhone: string, otherPhone: string, messages: StoredMessage[]): void {
    if (typeof window === 'undefined') return
    const key = `whatsapp_messages_${userPhone}_${otherPhone}`
    localStorage.setItem(key, JSON.stringify(messages))
    console.log(`💾 Saved ${messages.length} messages for conversation ${userPhone} <-> ${otherPhone}`)
  }

  getMessages(userPhone: string, otherPhone: string): StoredMessage[] {
    if (typeof window === 'undefined') return []
    const key1 = `whatsapp_messages_${userPhone}_${otherPhone}`
    const key2 = `whatsapp_messages_${otherPhone}_${userPhone}`
    
    const messages1 = localStorage.getItem(key1)
    const messages2 = localStorage.getItem(key2)
    
    const allMessages = [
      ...(messages1 ? JSON.parse(messages1) : []),
      ...(messages2 ? JSON.parse(messages2) : [])
    ]
    
    // Remove duplicates and sort by timestamp
    const uniqueMessages = allMessages.filter((msg, index, self) => 
      index === self.findIndex(m => m._id === msg._id)
    )
    
    return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  addMessage(userPhone: string, message: StoredMessage): void {
    if (typeof window === 'undefined') return
    
    const otherPhone = message.from_phone === userPhone ? message.to_phone : message.from_phone
    const existingMessages = this.getMessages(userPhone, otherPhone)
    
    // Check if message already exists
    const messageExists = existingMessages.some(msg => msg._id === message._id)
    if (!messageExists) {
      existingMessages.push(message)
      this.saveMessages(userPhone, otherPhone, existingMessages)
      console.log('💬 Added message to storage:', message.message_text.substring(0, 50))
      
      // Update conversation with this new message
      const conversations = this.getConversations(userPhone)
      const contactName = this.getContactName(userPhone, otherPhone)
      const existingIndex = conversations.findIndex(conv => conv.wa_id === otherPhone)
      
      const updatedConv: StoredConversation = {
        wa_id: otherPhone,
        name: contactName,
        last_message: message.message_text,
        last_message_time: message.timestamp,
        unread_count: this.calculateUnreadCount(userPhone, otherPhone)
      }
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = { ...conversations[existingIndex], ...updatedConv }
      } else {
        conversations.unshift(updatedConv)
      }
      
      this.saveConversations(userPhone, conversations)
    }
  }

  // Contacts
  saveContact(userPhone: string, contact: StoredContact): void {
    if (typeof window === 'undefined') return
    const contacts = this.getContacts(userPhone)
    const existingIndex = contacts.findIndex(c => c.phone === contact.phone)
    
    if (existingIndex >= 0) {
      contacts[existingIndex] = { ...contacts[existingIndex], ...contact }
    } else {
      contacts.push(contact)
    }
    
    localStorage.setItem(this.getStorageKey(userPhone, 'contacts'), JSON.stringify(contacts))
  }

  getContacts(userPhone: string): StoredContact[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.getStorageKey(userPhone, 'contacts'))
    return stored ? JSON.parse(stored) : []
  }

  getContactName(userPhone: string, phone: string): string {
    const contacts = this.getContacts(userPhone)
    const contact = contacts.find(c => c.phone === phone)
    return contact?.custom_name || contact?.name || `User ${phone.slice(-4)}`
  }

  // Clear all data for a user
  clearUserData(userPhone: string): void {
    if (typeof window === 'undefined') return
    const keys = Object.keys(localStorage).filter(key => key.includes(userPhone))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

export const chatStorage = new ChatStorage()
