import { MongoClient } from 'mongodb'

export async function testMongoConnection() {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  console.log('🔗 Testing MongoDB connection...')
  
  try {
    const client = new MongoClient(uri)
    await client.connect()
    
    // Test the connection
    const db = client.db('whatsapp')
    const collections = await db.listCollections().toArray()
    
    console.log('✅ MongoDB connection successful!')
    console.log(`📊 Database: whatsapp`)
    console.log(`📁 Collections: ${collections.length}`)
    
    await client.close()
    return true
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    return false
  }
}
