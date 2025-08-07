'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User, authService } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  login: (phone: string, otp: string) => Promise<boolean>
  logout: () => void
  sendOTP: (phone: string) => Promise<string>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = authService.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const sendOTP = async (phone: string): Promise<string> => {
    return await authService.sendOTP(phone)
  }

  const login = async (phone: string, otp: string): Promise<boolean> => {
    const user = await authService.login(phone, otp)
    if (user) {
      setUser(user)
      authService.saveUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    authService.clearUser()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, sendOTP, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
