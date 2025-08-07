import { ObjectId } from 'mongodb'
import { getDatabase } from '../mongodb'

export interface EnhancedMessage {
  _id?: ObjectId
  from_phone: string
  to_phone: string
  message_text: string
  timestamp: string
  message_type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
  sender_name?: string
  meta_msg_id?: string
  webhook_payload?: any
  created_at: Date
  updated_at: Date
}

export class EnhancedMessageModel {
  private static collection = 'enhanced_messages'

  static async create(messageData: Omit<EnhancedMessage, '_id' | 'created_at' | 'updated_at'>): Promise<EnhancedMessage> {
    const db = await getDatabase()
    const now = new Date()
    
    const message: EnhancedMessage = {
      ...messageData,
      created_at: now,
      updated_at: now
    }

    const result = await db.collection(this.collection).insertOne(message)
    return { ...message, _id: result.insertedId }
  }

  static async getConversationsForUser(userPhone: string): Promise<any[]> {
    const db = await getDatabase()
    
    try {
      const conversations = await db.collection(this.collection).aggregate([
        {
          $match: {
            $or: [
              { from_phone: userPhone },
              { to_phone: userPhone }
            ]
          }
        },
        {
          $addFields: {
            other_phone: {
              $cond: {
                if: { $eq: ['$from_phone', userPhone] },
                then: '$to_phone',
                else: '$from_phone'
              }
            },
            other_name: {
              $cond: {
                if: { $eq: ['$from_phone', userPhone] },
                then: { $concat: ['User ', { $substr: ['$to_phone', -4, 4] }] },
                else: {
                  $cond: {
                    if: { $ne: ['$sender_name', null] },
                    then: '$sender_name',
                    else: { $concat: ['User ', { $substr: ['$from_phone', -4, 4] }] }
                  }
                }
              }
            }
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: '$other_phone',
            last_message: { $first: '$message_text' },
            last_message_time: { $first: '$timestamp' },
            name: { $first: '$other_name' },
            messages: { $push: '$$ROOT' }
          }
        },
        {
          $addFields: {
            wa_id: '$_id',
            unread_count: {
              $size: {
                $filter: {
                  input: '$messages',
                  cond: { 
                    $and: [
                      { $eq: ['$$this.to_phone', userPhone] },
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
      console.error('Error in getConversationsForUser:', error)
      return []
    }
  }

  static async getMessagesBetweenUsers(user1: string, user2: string): Promise<EnhancedMessage[]> {
    const db = await getDatabase()
    return await db.collection(this.collection)
      .find({
        $or: [
          { from_phone: user1, to_phone: user2 },
          { from_phone: user2, to_phone: user1 }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray() as EnhancedMessage[]
  }

  static async markMessagesAsRead(fromPhone: string, toPhone: string): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection(this.collection).updateMany(
      { 
        from_phone: fromPhone,
        to_phone: toPhone,
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
}
