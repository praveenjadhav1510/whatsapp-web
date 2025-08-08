'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(userPhone?: string) {
const [socket, setSocket] = useState<Socket | null>(null)
const [isConnected, setIsConnected] = useState(false)
const [connectionAttempts, setConnectionAttempts] = useState(0)

useEffect(() => {
  if (!userPhone) return

  console.log('🔌 Initializing socket connection for user:', userPhone)

  // Initialize socket connection with better configuration
  const socketURL =
    typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_SOCKET_URL || undefined)
      : undefined

  const socketInstance = io(socketURL, {
    path: '/api/socketio',
    addTrailingSlash: false,
    // Prefer websocket first for cross-origin stability; fall back to polling
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    query: {
      userPhone: userPhone
    }
  })

  socketInstance.on('connect', () => {
    console.log('✅ Connected to socket server:', socketInstance.id)
    setIsConnected(true)
    setConnectionAttempts(0)
    
    // Join user-specific room for cross-session messaging
    socketInstance.emit('join-user', userPhone)
  })

  socketInstance.on('disconnect', (reason) => {
    console.log('❌ Disconnected from socket server:', reason)
    setIsConnected(false)
  })

  socketInstance.on('connect_error', (error) => {
    console.error('🚫 Socket connection error:', error)
    setIsConnected(false)
    setConnectionAttempts(prev => prev + 1)
  })

  socketInstance.on('reconnect', (attemptNumber) => {
    console.log('🔄 Reconnected after', attemptNumber, 'attempts')
    setIsConnected(true)
    setConnectionAttempts(0)
  })

  socketInstance.on('reconnect_error', (error) => {
    console.error('🔄❌ Reconnection failed:', error)
  })

  setSocket(socketInstance)

  return () => {
    console.log('🔌 Cleaning up socket connection')
    socketInstance.disconnect()
  }
}, [userPhone])

return { socket, isConnected, connectionAttempts }
}
