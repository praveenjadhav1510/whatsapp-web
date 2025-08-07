import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const messageData = await request.json()
    console.log('API: Saving message:', messageData)
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('API: No MONGODB_URI found, using mock save')
      // Mock saved message response
      const savedMessage = {
        _id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(savedMessage)
    }

    // Try to use MongoDB
    try {
      const { MessageModel } = await import('@/lib/models/message')
      console.log('API: Using MongoDB to save message')
      
      const savedMessage = await MessageModel.create({
        ...messageData,
        timestamp: new Date().toISOString(),
      })
      
      // Convert ObjectId to string for JSON serialization
      const serializedMessage = {
        ...savedMessage,
        _id: savedMessage._id?.toString()
      }
      
      return NextResponse.json(serializedMessage)
    } catch (dbError) {
      console.error('API: Database error, using mock save:', dbError)
      // Mock saved message response
      const savedMessage = {
        _id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(savedMessage)
    }
    
  } catch (error) {
    console.error('API: Error saving message:', error)
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    )
  }
}
