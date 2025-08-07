import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export interface SocketMessage {
  _id: string
  wa_id: string
  text: string
  timestamp: string
  type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
}

export interface TypingData {
  wa_id: string
  userId: string
  isTyping: boolean
}

export interface StatusUpdateData {
  messageId: string
  wa_id: string
  status: 'sent' | 'delivered' | 'read'
}
