import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        success: false, 
        message: 'MONGODB_URI environment variable is not set. Please add it to your .env.local file.' 
      }, { status: 500 })
    }

    // Try to connect to MongoDB
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(process.env.MONGODB_URI)
    
    await client.connect()
    
    // Test the connection
    const db = client.db('whatsapp')
    await db.admin().ping()
    
    // Get some basic info
    const collections = await db.listCollections().toArray()
    
    await client.close()
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully connected to MongoDB! Found ${collections.length} collections.`,
      collections: collections.map(c => c.name)
    })
    
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    
    let errorMessage = 'Unknown database error'
    
    if (error.message.includes('authentication failed')) {
      errorMessage = 'Authentication failed. Please check your username and password in the MongoDB connection string.'
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your network access settings in MongoDB Atlas.'
    } else if (error.code === 8000) {
      errorMessage = 'MongoDB Atlas authentication error. Verify your credentials and network access.'
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      details: error.message
    }, { status: 500 })
  }
}
