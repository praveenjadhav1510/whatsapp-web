import { MongoClient, Db, type MongoClientOptions } from 'mongodb'

if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI environment variable is not set')
}

const uri = process.env.MONGODB_URI || ''
const options: MongoClientOptions = {
  // Use Stable API V1 for Atlas to improve compatibility
  serverApi: { version: '1' as any, strict: false, deprecationErrors: false },
  // TLS is required for Atlas; keep it explicit
  tls: true,
  // DEV-ONLY escape hatch for SSL inspection issues. Set MONGODB_TLS_INSECURE=true to test locally.
  tlsAllowInvalidCertificates: process.env.MONGODB_TLS_INSECURE === 'true',
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db('whatsapp')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export default clientPromise
