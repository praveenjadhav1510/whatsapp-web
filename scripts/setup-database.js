import { MongoClient } from 'mongodb'

async function setupDatabase() {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set')
    console.log('Please add your MongoDB Atlas connection string to .env.local')
    return
  }

  try {
    console.log('🚀 Setting up WhatsApp database...')
    
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('whatsapp')
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...')
    
    const messagesCollection = db.collection('processed_messages')
    
    // Index on wa_id for faster conversation queries
    await messagesCollection.createIndex({ wa_id: 1 })
    console.log('✅ Created index on wa_id')
    
    // Index on timestamp for sorting messages
    await messagesCollection.createIndex({ timestamp: 1 })
    console.log('✅ Created index on timestamp')
    
    // Compound index for efficient conversation queries
    await messagesCollection.createIndex({ wa_id: 1, timestamp: -1 })
    console.log('✅ Created compound index on wa_id + timestamp')
    
    // Index on meta_msg_id for webhook updates
    await messagesCollection.createIndex({ meta_msg_id: 1 }, { sparse: true })
    console.log('✅ Created index on meta_msg_id')
    
    console.log('🎉 Database setup completed successfully!')
    
    await client.close()
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string')
    } else if (error.message.includes('network')) {
      console.log('💡 Check your network access settings in MongoDB Atlas')
    }
  }
}

setupDatabase()
