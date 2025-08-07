'use client'

import { useState, useEffect } from 'react'
import { MongoDBSetupGuide } from '@/components/mongodb-setup-guide'

export default function SetupPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking')
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus('connected')
        setErrorMessage('')
      } else {
        setConnectionStatus('error')
        setErrorMessage(data.message || 'Connection failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      setErrorMessage('Failed to test connection')
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'connected': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
      case 'connected':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  if (showGuide) {
    return <MongoDBSetupGuide />
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            WhatsApp Web Clone Setup
          </h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Database Connection Status</h2>
            <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor()}`}>
              {getStatusIcon()}
              <div>
                <p className="font-medium">
                  {connectionStatus === 'checking' && 'Checking connection...'}
                  {connectionStatus === 'connected' && 'Database connected successfully!'}
                  {connectionStatus === 'error' && 'Database connection failed'}
                </p>
                {errorMessage && (
                  <p className="text-sm mt-1">{errorMessage}</p>
                )}
              </div>
              <button
                onClick={checkConnection}
                className="ml-auto px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-75 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Error Details */}
          {connectionStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Common Issues:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>Authentication failed:</strong> Check your username and password in the connection string</li>
                <li>• <strong>Network error:</strong> Ensure network access is configured (0.0.0.0/0)</li>
                <li>• <strong>Missing MONGODB_URI:</strong> Make sure the environment variable is set in .env.local</li>
                <li>• <strong>Wrong database name:</strong> Ensure the database name is "whatsapp" in your connection string</li>
              </ul>
            </div>
          )}

          {/* Setup Options */}
          <div className="space-y-4">
            {connectionStatus === 'error' && (
              <button
                onClick={() => setShowGuide(true)}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                📚 Step-by-Step MongoDB Atlas Setup Guide
              </button>
            )}

            {connectionStatus === 'connected' && (
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          wa_id: '1234567890',
                          text: 'Test message from setup',
                          type: 'incoming',
                          status: 'delivered',
                          sender_name: 'Setup Test'
                        })
                      })
                      if (response.ok) {
                        alert('Sample data added successfully!')
                      }
                    } catch (error) {
                      alert('Failed to add sample data')
                    }
                  }}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  ✅ Add Sample Data
                </button>
                
                <a
                  href="/"
                  className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-center"
                >
                  🚀 Go to WhatsApp Web Clone
                </a>
              </div>
            )}

            <div className="text-center">
              <a
                href="/"
                className="text-blue-600 hover:underline text-sm"
              >
                Continue with mock data (no database required)
              </a>
            </div>
          </div>

          {/* Environment Variable Example */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Environment Variable Format:</h3>
            <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
              MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/whatsapp?retryWrites=true&w=majority
            </code>
            <p className="text-xs text-gray-600 mt-2">
              Add this to your .env.local file in the project root
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
