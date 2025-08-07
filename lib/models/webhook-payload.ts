import { ObjectId } from 'mongodb'
import { getDatabase } from '../mongodb'

export interface WebhookPayload {
  _id?: ObjectId
  payload_type: string
  metaData: {
    entry: Array<{
      changes: Array<{
        field: string
        value: {
          contacts?: Array<{
            profile: { name: string }
            wa_id: string
          }>
          messages?: Array<{
            from: string
            id: string
            timestamp: string
            text?: { body: string }
            type: string
          }>
          statuses?: Array<{
            id: string
            status: string
            timestamp: string
            recipient_id: string
          }>
          messaging_product: string
          metadata: {
            display_phone_number: string
            phone_number_id: string
          }
        }
      }>
      id: string
    }>
    gs_app_id: string
    object: string
  }
  createdAt: string
  startedAt: string
  completedAt: string
  executed: boolean
}

export class WebhookPayloadModel {
  private static collection = 'webhook_payloads'

  static async create(payload: Omit<WebhookPayload, '_id'>): Promise<WebhookPayload> {
    const db = await getDatabase()
    const result = await db.collection(this.collection).insertOne(payload)
    return { ...payload, _id: result.insertedId }
  }

  static async findAll(): Promise<WebhookPayload[]> {
    const db = await getDatabase()
    return await db.collection(this.collection)
      .find({})
      .sort({ createdAt: -1 })
      .toArray() as WebhookPayload[]
  }

  static async findByPhoneNumber(phoneNumber: string): Promise<WebhookPayload[]> {
    const db = await getDatabase()
    return await db.collection(this.collection)
      .find({
        $or: [
          { 'metaData.entry.changes.value.messages.from': phoneNumber },
          { 'metaData.entry.changes.value.metadata.display_phone_number': phoneNumber }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray() as WebhookPayload[]
  }
}
