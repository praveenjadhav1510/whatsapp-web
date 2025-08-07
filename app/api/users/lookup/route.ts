import { NextResponse } from 'next/server'

// Fake user database for demo
const fakeUsers = {
  '919937320320': { name: 'Ravi Kumar', status: 'online' },
  '918329446654': { name: 'Business Account', status: 'online' },
  '919876543210': { name: 'Priya Sharma', status: 'online' },
  '919123456789': { name: 'Amit Singh', status: 'online' },
  '919988776655': { name: 'Sneha Patel', status: 'online' },
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log('API: Looking up user:', phone)
    
    // Check if user exists in our fake database
    const userData = fakeUsers[phone as keyof typeof fakeUsers]
    
    if (userData) {
      return NextResponse.json({
        exists: true,
        name: userData.name,
        phone: phone,
        status: userData.status
      })
    } else {
      // Create a new user entry
      const newUserName = `User ${phone.slice(-4)}`
      fakeUsers[phone as keyof typeof fakeUsers] = { 
        name: newUserName, 
        status: 'online' 
      }
      
      return NextResponse.json({
        exists: true,
        name: newUserName,
        phone: phone,
        status: 'online',
        isNew: true
      })
    }
    
  } catch (error) {
    console.error('API: Error looking up user:', error)
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    )
  }
}
