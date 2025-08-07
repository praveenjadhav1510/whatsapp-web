import { NextResponse } from 'next/server'
import { EnhancedMessageModel } from '@/lib/models/enhanced-message'

export async function POST(request: Request) {
  try {
    const { user1, user2 } = await request.json()
    
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: 'Both user phone numbers are required' },
        { status: 400 }
      )
    }

    console.log('API: Fetching messages between:', user1, 'and', user2)
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, returning empty for client-side handling')
      return NextResponse.json([])
    }

    try {
      const messages = await EnhancedMessageModel.getMessagesBetweenUsers(user1, user2)
      
      // Mark messages as read
      await EnhancedMessageModel.markMessagesAsRead(user2, user1)
      
      // Convert ObjectId to string for JSON serialization
      const serializedMessages = messages.map(msg => ({
        ...msg,
        _id: msg._id?.toString()
      }))
      
      console.log('API: Found messages:', serializedMessages.length)
      return NextResponse.json(serializedMessages)
    } catch (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json([])
    }
    
  } catch (error) {
    console.error('API: Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
