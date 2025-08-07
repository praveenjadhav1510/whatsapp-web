import { NextResponse } from 'next/server'
import { MessageModel } from '@/lib/models/message'

export async function PUT(request: Request) {
  try {
    const { messageId, meta_msg_id, status } = await request.json()
    
    let updated = false
    
    if (messageId) {
      updated = await MessageModel.updateStatus(messageId, status)
    } else if (meta_msg_id) {
      updated = await MessageModel.updateStatusByMetaId(meta_msg_id, status)
    }
    
    if (updated) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Message not found or not updated' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating message status:', error)
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    )
  }
}
