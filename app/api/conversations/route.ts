import { NextResponse } from 'next/server'

// Mock conversations for when database is not available
const mockConversations = [
  {
    wa_id: '1234567890',
    name: 'John Doe',
    last_message: 'Hey, how are you doing?',
    last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread_count: 2,
  },
  {
    wa_id: '0987654321',
    name: 'Jane Smith',
    last_message: 'Thanks for the help!',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread_count: 0,
  },
  {
    wa_id: '5555555555',
    name: 'Mike Johnson',
    last_message: 'See you tomorrow',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread_count: 1,
  },
]

export async function GET() {
  try {
    console.log('API: Fetching conversations...')
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, using mock data')
      return NextResponse.json(mockConversations)
    }

    // Try to import and use MongoDB
    try {
      const { MessageModel } = await import('@/lib/models/message')
      console.log('API: Using MongoDB for conversations')
      const conversations = await MessageModel.getConversations()
      
      // If no conversations in DB, return mock data
      if (!conversations || conversations.length === 0) {
        console.log('API: No conversations in DB, using mock data')
        return NextResponse.json(mockConversations)
      }
      
      return NextResponse.json(conversations)
    } catch (dbError) {
      console.error('API: Database error, falling back to mock data:', dbError)
      return NextResponse.json(mockConversations)
    }
    
  } catch (error) {
    console.error('API: Error in conversations route:', error)
    // Always return mock data as fallback
    return NextResponse.json(mockConversations)
  }
}
