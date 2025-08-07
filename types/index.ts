export interface Message {
  _id: string
  wa_id: string
  text: string
  timestamp: string
  type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read' | 'sending'
  sender_name?: string
  meta_msg_id?: string
}

export interface Conversation {
  wa_id: string
  name: string
  last_message: string
  last_message_time: string
  unread_count: number
  profile_picture?: string
}
