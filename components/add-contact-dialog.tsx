'use client'

import { useState } from 'react'

interface AddContactDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddContact: (phone: string, name: string) => void
  initialPhone?: string
}

export function AddContactDialog({ isOpen, onClose, onAddContact, initialPhone = '' }: AddContactDialogProps) {
  const [phone, setPhone] = useState(initialPhone)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !name.trim()) {
      setError('Please enter both phone number and name')
      return
    }

    const cleanPhone = phone.replace(/[^\d]/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }

    setLoading(true)
    setError('')

    try {
      onAddContact(cleanPhone, name.trim())
      setPhone('')
      setName('')
      onClose()
    } catch (error) {
      console.error('Error adding contact:', error)
      setError('Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  const quickContacts = [
    { phone: '919937320320', name: 'Ravi Kumar' },
    { phone: '918329446654', name: 'Business Account' },
    { phone: '919876543210', name: 'Priya Sharma' },
    { phone: '919123456789', name: 'Amit Singh' },
    { phone: '919988776655', name: 'Sneha Patel' },
  ]

  const handleQuickAdd = (contact: { phone: string; name: string }) => {
    setPhone(contact.phone)
    setName(contact.name)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Contact</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter contact name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Contact...' : 'Add Contact'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Quick add demo contacts:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {quickContacts.map((contact) => (
                <button
                  key={contact.phone}
                  onClick={() => handleQuickAdd(contact)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600">+{contact.phone}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
