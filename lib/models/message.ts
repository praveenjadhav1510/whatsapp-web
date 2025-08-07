import { ObjectId } from 'mongodb'
import { getDatabase } from '../mongodb'

export interface MessageDocument {
  _id?: ObjectId
  wa_id: string
  text: string
  timestamp: string
  type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
  meta_msg_id?: string
  created_at?: Date
  updated_at?: Date
}

export class MessageModel {
  private static collection = 'processed_messages'

  static async create(messageData: Omit<MessageDocument, '_id' | 'created_at' | 'updated_at'>): Promise<MessageDocument> {
    const db = await getDatabase()
    const now = new Date()
    
    const message: MessageDocument = {
      ...messageData,
      created_at: now,
      updated_at: now
    }

    const result = await db.collection(this.collection).insertOne(message)
    return { ...message, _id: result.insertedId }
  }

  static async findByWaId(wa_id: string): Promise<MessageDocument[]> {
    const db = await getDatabase()
    return await db.collection(this.collection)
      .find({ wa_id })
      .sort({ timestamp: 1 })
      .toArray() as MessageDocument[]
  }

  static async updateStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection(this.collection).updateOne(
      { _id: new ObjectId(messageId) },
      { 
        $set: { 
          status,
          updated_at: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  static async updateStatusByMetaId(meta_msg_id: string, status: 'sent' | 'delivered' | 'read'): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection(this.collection).updateOne(
      { meta_msg_id },
      { 
        $set: { 
          status,
          updated_at: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  static async getConversations(): Promise<any[]> {
    const db = await getDatabase()
    
    try {
      // Aggregate to get the latest message for each wa_id
      const conversations = await db.collection(this.collection).aggregate([
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: '$wa_id',
            last_message: { $first: '$text' },
            last_message_time: { $first: '$timestamp' },
            sender_name: { $first: '$sender_name' },
            messages: { $push: '$$ROOT' }
          }
        },
        {
          $addFields: {
            wa_id: '$_id',
            name: {
              $cond: {
                if: { $ne: ['$sender_name', null] },
                then: '$sender_name',
                else: { $concat: ['+', '$_id'] }
              }
            },
            unread_count: {
              $size: {
                $filter: {
                  input: '$messages',
                  cond: { 
                    $and: [
                      { $eq: ['$$this.type', 'incoming'] },
                      { $ne: ['$$this.status', 'read'] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            wa_id: 1,
            name: 1,
            last_message: 1,
            last_message_time: 1,
            unread_count: 1
          }
        },
        {
          $sort: { last_message_time: -1 }
        }
      ]).toArray()

      return conversations
    } catch (error) {
      console.error('Error in getConversations aggregation:', error)
      // Fallback to simple query if aggregation fails
      return []
    }
  }

  static async markMessagesAsRead(wa_id: string): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection(this.collection).updateMany(
      { 
        wa_id,
        type: 'incoming',
        status: { $ne: 'read' }
      },
      { 
        $set: { 
          status: 'read',
          updated_at: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  static async insertWebhookMessages(messages: any[]): Promise<boolean> {
    const db = await getDatabase()
    
    if (messages.length === 0) return true

    try {
      const processedMessages = messages.map(msg => ({
        ...msg,
        created_at: new Date(),
        updated_at: new Date()
      }))

      await db.collection(this.collection).insertMany(processedMessages, { ordered: false })
      return true
    } catch (error: any) {
      // Handle duplicate key errors (messages already exist)
      if (error.code === 11000) {
        console.log('Some messages already exist, skipping duplicates')
        return true
      }
      throw error
    }
  }
}
