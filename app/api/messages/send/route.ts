import { NextResponse } from 'next/server'
import { EnhancedMessageModel } from '@/lib/models/enhanced-message'

export async function POST(request: Request) {
  try {
    const { from_phone, to_phone, message_text, sender_name } = await request.json()
    
    if (!from_phone || !to_phone || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the message
    const messageData = {
      from_phone,
      to_phone,
      message_text,
      timestamp: new Date().toISOString(),
      message_type: 'outgoing' as const,
      status: 'sent' as const,
      sender_name,
      meta_msg_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, using mock save')
      
      const mockMessage = {
        _id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString(),
      }
      
      return NextResponse.json(mockMessage)
    }

    try {
      const savedMessage = await EnhancedMessageModel.create(messageData)

      // Convert ObjectId to string for JSON serialization
      const serializedMessage = {
        ...savedMessage,
        _id: savedMessage._id?.toString()
      }

      return NextResponse.json(serializedMessage)
    } catch (dbError) {
      console.error('API: Database error, using mock save:', dbError)
      const mockMessage = {
        _id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(mockMessage)
    }
    
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
