import { NextResponse } from 'next/server'
import { MessageModel } from '@/lib/models/message'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }
    
    const success = await MessageModel.insertWebhookMessages(messages)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        processed: messages.length 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to process messages' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing webhook messages:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook messages' },
      { status: 500 }
    )
  }
}
