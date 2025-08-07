import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

let io: ServerIO | undefined

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server...')
    
    // Create HTTP server for Socket.IO
    const httpServer = new NetServer()
    
    io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join user to their personal room
      socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined their room`)
      })

      // Join conversation room
      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`)
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
      })

      // Leave conversation room
      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`)
        console.log(`Socket ${socket.id} left conversation ${conversationId}`)
      })

      // Handle new message
      socket.on('send-message', (data) => {
        console.log('Broadcasting message:', data)
        socket.to(`conversation-${data.wa_id}`).emit('new-message', data)
      })

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        socket.to(`conversation-${data.wa_id}`).emit('user-typing', {
          wa_id: data.wa_id,
          userId: data.userId,
          isTyping: true
        })
      })

      socket.on('typing-stop', (data) => {
        socket.to(`conversation-${data.wa_id}`).emit('user-typing', {
          wa_id: data.wa_id,
          userId: data.userId,
          isTyping: false
        })
      })

      // Handle message status updates
      socket.on('message-status-update', (data) => {
        console.log('Broadcasting status update:', data)
        socket.to(`conversation-${data.wa_id}`).emit('message-status-changed', data)
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    console.log('Socket.IO server initialized')
  }

  return new Response('Socket.IO server is running', { status: 200 })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
