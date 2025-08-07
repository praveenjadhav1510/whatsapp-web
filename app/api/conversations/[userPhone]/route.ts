import { NextResponse } from 'next/server'
import { EnhancedMessageModel } from '@/lib/models/enhanced-message'

export async function GET(
  request: Request,
  { params }: { params: { userPhone: string } }
) {
  try {
    const { userPhone } = params
    console.log('API: Fetching conversations for user:', userPhone)
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, returning empty for client-side handling')
      return NextResponse.json([])
    }

    try {
      const conversations = await EnhancedMessageModel.getConversationsForUser(userPhone)
      console.log('API: Found conversations:', conversations.length)
      return NextResponse.json(conversations || [])
    } catch (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json([])
    }
    
  } catch (error) {
    console.error('API: Error in conversations route:', error)
    return NextResponse.json([])
  }
}
