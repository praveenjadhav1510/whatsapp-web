import { MongoClient } from 'mongodb'

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(uri)

// Sample data to seed the database
const sampleMessages = [
  {
    wa_id: '1234567890',
    text: 'Hello! How are you doing today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'incoming',
    status: 'read',
    sender_name: 'John Doe',
    meta_msg_id: 'msg_001'
  },
  {
    wa_id: '1234567890',
    text: "I'm doing great, thanks for asking! How about you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    type: 'outgoing',
    status: 'read'
  },
  {
    wa_id: '1234567890',
    text: "That's wonderful to hear! I'm having a productive day.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: 'incoming',
    status: 'read',
    sender_name: 'John Doe',
    meta_msg_id: 'msg_002'
  },
  {
    wa_id: '0987654321',
    text: 'Can you help me with the project we discussed?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'incoming',
    status: 'read',
    sender_name: 'Jane Smith',
    meta_msg_id: 'msg_003'
  },
  {
    wa_id: '0987654321',
    text: "Of course! I'll send you the details right away.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
    type: 'outgoing',
    status: 'delivered'
  },
  {
    wa_id: '0987654321',
    text: 'Perfect! Thanks for the quick response.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'incoming',
    status: 'delivered',
    sender_name: 'Jane Smith',
    meta_msg_id: 'msg_004'
  },
  {
    wa_id: '5555555555',
    text: 'Are we still meeting tomorrow at 3 PM?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    type: 'outgoing',
    status: 'read'
  },
  {
    wa_id: '5555555555',
    text: "Yes, see you tomorrow! Don't forget to bring the documents.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: 'incoming',
    status: 'sent',
    sender_name: 'Mike Johnson',
    meta_msg_id: 'msg_005'
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample messages...')
    
    await client.connect()
    const db = client.db('whatsapp')
    const collection = db.collection('processed_messages')
    
    for (const messageData of sampleMessages) {
      try {
        const messageWithTimestamps = {
          ...messageData,
          created_at: new Date(),
          updated_at: new Date()
        }
        
        await collection.insertOne(messageWithTimestamps)
        console.log(`✅ Created message: ${messageData.text.substring(0, 50)}...`)
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Message already exists, skipping...`)
        } else {
          console.error(`❌ Error creating message:`, error.message)
        }
      }
    }
    
    console.log('🎉 Database seeding completed!')
    
    // Display summary
    const totalMessages = await collection.countDocuments()
    const conversations = await collection.distinct('wa_id')
    console.log(`📊 Total messages: ${totalMessages}`)
    console.log(`📊 Total conversations: ${conversations.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await client.close()
  }
}

// Run the seeder
seedDatabase()
