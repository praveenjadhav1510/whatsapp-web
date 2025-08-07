import { NextResponse } from 'next/server'

// Mock messages for when database is not available
const mockMessages = {
  '1234567890': [
    {
      _id: '1',
      wa_id: '1234567890',
      text: 'Hello! How are you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      type: 'incoming' as const,
      status: 'read' as const,
      sender_name: 'John Doe',
    },
    {
      _id: '2',
      wa_id: '1234567890',
      text: "I'm doing great, thanks for asking!",
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      type: 'outgoing' as const,
      status: 'read' as const,
    },
    {
      _id: '3',
      wa_id: '1234567890',
      text: 'Hey, how are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'incoming' as const,
      status: 'delivered' as const,
      sender_name: 'John Doe',
    },
  ],
  '0987654321': [
    {
      _id: '4',
      wa_id: '0987654321',
      text: 'Can you help me with the project?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      type: 'incoming' as const,
      status: 'read' as const,
      sender_name: 'Jane Smith',
    },
    {
      _id: '5',
      wa_id: '0987654321',
      text: "I'll send you the details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
      type: 'outgoing' as const,
      status: 'read' as const,
    },
    {
      _id: '6',
      wa_id: '0987654321',
      text: 'Thanks for the help!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      type: 'incoming' as const,
      status: 'read' as const,
      sender_name: 'Jane Smith',
    },
  ],
  '5555555555': [
    {
      _id: '7',
      wa_id: '5555555555',
      text: 'Are we still meeting tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      type: 'outgoing' as const,
      status: 'delivered' as const,
    },
    {
      _id: '8',
      wa_id: '5555555555',
      text: 'See you tomorrow',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      type: 'incoming' as const,
      status: 'sent' as const,
      sender_name: 'Mike Johnson',
    },
  ],
}

export async function GET(
  request: Request,
  { params }: { params: { waId: string } }
) {
  try {
    const { waId } = params
    console.log('API: Fetching messages for waId:', waId)
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, using mock messages')
      const messages = mockMessages[waId as keyof typeof mockMessages] || []
      return NextResponse.json(messages)
    }

    // Try to use MongoDB
    try {
      const { MessageModel } = await import('@/lib/models/message')
      console.log('API: Using MongoDB for messages')
      const messages = await MessageModel.findByWaId(waId)
      
      // Mark incoming messages as read when fetching
      await MessageModel.markMessagesAsRead(waId)
      
      // Convert ObjectId to string for JSON serialization
      const serializedMessages = messages.map(msg => ({
        ...msg,
        _id: msg._id?.toString()
      }))
      
      // If no messages in DB, return mock data
      if (serializedMessages.length === 0) {
        console.log('API: No messages in DB, using mock data')
        const mockData = mockMessages[waId as keyof typeof mockMessages] || []
        return NextResponse.json(mockData)
      }
      
      return NextResponse.json(serializedMessages)
    } catch (dbError) {
      console.error('API: Database error, falling back to mock data:', dbError)
      const messages = mockMessages[waId as keyof typeof mockMessages] || []
      return NextResponse.json(messages)
    }
    
  } catch (error) {
    console.error('API: Error fetching messages:', error)
    const messages = mockMessages[params.waId as keyof typeof mockMessages] || []
    return NextResponse.json(messages)
  }
}
