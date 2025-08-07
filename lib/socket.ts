import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    res.socket.server.io = io

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
        // Broadcast to all users in the conversation except sender
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

      // Handle online status
      socket.on('user-online', (userId: string) => {
        socket.broadcast.emit('user-status-changed', {
          userId,
          isOnline: true,
          lastSeen: new Date().toISOString()
        })
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        // You could broadcast user offline status here
      })
    })
  }
  res.end()
}

export default SocketHandler
