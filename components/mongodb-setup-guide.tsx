'use client'

import { useState } from 'react'

export function MongoDBSetupGuide() {
  const [step, setStep] = useState(1)
  const [connectionString, setConnectionString] = useState('')

  const steps = [
    {
      title: "Create MongoDB Atlas Account",
      content: (
        <div className="space-y-3">
          <p>1. Go to <a href="https://www.mongodb.com/atlas" target="_blank" className="text-blue-600 hover:underline">MongoDB Atlas</a></p>
          <p>2. Click "Try Free" and create an account</p>
          <p>3. Verify your email address</p>
        </div>
      )
    },
    {
      title: "Create a Free Cluster",
      content: (
        <div className="space-y-3">
          <p>1. Click "Create" or "Build a Database"</p>
          <p>2. Choose <strong>"M0 Sandbox"</strong> (Free tier)</p>
          <p>3. Select your preferred cloud provider (AWS recommended)</p>
          <p>4. Choose a region closest to you</p>
          <p>5. Name your cluster (e.g., "whatsapp-cluster")</p>
          <p>6. Click "Create Cluster"</p>
        </div>
      )
    },
    {
      title: "Create Database User",
      content: (
        <div className="space-y-3">
          <p>1. Go to <strong>"Database Access"</strong> in the left sidebar</p>
          <p>2. Click <strong>"Add New Database User"</strong></p>
          <p>3. Choose <strong>"Password"</strong> authentication method</p>
          <p>4. Create a username and <strong>strong password</strong></p>
          <p>5. Set privileges to <strong>"Read and write to any database"</strong></p>
          <p>6. Click <strong>"Add User"</strong></p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Remember your username and password - you'll need them for the connection string!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Configure Network Access",
      content: (
        <div className="space-y-3">
          <p>1. Go to <strong>"Network Access"</strong> in the left sidebar</p>
          <p>2. Click <strong>"Add IP Address"</strong></p>
          <p>3. Click <strong>"Allow Access from Anywhere"</strong> (0.0.0.0/0)</p>
          <p>4. Click <strong>"Confirm"</strong></p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> For production, you should restrict access to specific IP addresses.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Get Connection String",
      content: (
        <div className="space-y-3">
          <p>1. Go to <strong>"Database"</strong> in the left sidebar</p>
          <p>2. Click <strong>"Connect"</strong> on your cluster</p>
          <p>3. Choose <strong>"Connect your application"</strong></p>
          <p>4. Select <strong>"Node.js"</strong> and version <strong>"4.1 or later"</strong></p>
          <p>5. Copy the connection string</p>
          <div className="bg-gray-50 border rounded p-3 mt-3">
            <p className="text-sm font-mono">
              mongodb+srv://praveenjadhav:&lt;password&gt;@whatsapp-web.zq243jo.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=whatsapp-web
            </p>
          </div>
          <p className="text-sm text-red-600">
            <strong>Important:</strong> Replace &lt;password&gt; with your actual database user password!
          </p>
        </div>
      )
    },
    {
      title: "Update Environment Variables",
      content: (
        <div className="space-y-3">
          <p>1. Create or update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file</p>
          <p>2. Add your connection string:</p>
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
            MONGODB_URI=mongodb+srv://praveenjadhav:YOUR_PASSWORD_HERE@whatsapp-web.zq243jo.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=whatsapp-web
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-2">Test your connection string:</label>
            <input
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="Paste your connection string here"
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
            {connectionString && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">✅ Connection string format looks correct!</p>
              </div>
            )}
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">MongoDB Atlas Setup Guide</h1>
          <p className="text-gray-600 mt-2">Follow these steps to set up your MongoDB Atlas database</p>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index + 1 <= step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index + 1 < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Step {step} of {steps.length}: {steps[step - 1].title}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{steps[step - 1].title}</h2>
          <div className="text-gray-700">
            {steps[step - 1].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(Math.min(steps.length, step + 1))}
            disabled={step === steps.length}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === steps.length ? 'Complete' : 'Next'}
          </button>
        </div>

        {/* Quick Test */}
        {step === steps.length && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-3">Quick Connection Test</h3>
            <p className="text-sm text-gray-600 mb-3">
              After updating your .env.local file, restart your development server and refresh this page.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Connection
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 inline-block"
              >
                Go to App
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
