// Auth utility functions and types
export interface User {
  phone: string
  name: string
  isAuthenticated: boolean
}

// Fake OTP generation and validation
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const fakeUsers = {
  '919937320320': { name: 'Ravi Kumar', otp: '' },
  '918329446654': { name: 'Business Account', otp: '' },
  '919876543210': { name: 'Priya Sharma', otp: '' },
  '919123456789': { name: 'Amit Singh', otp: '' },
  '919988776655': { name: 'Sneha Patel', otp: '' },
}

export const authService = {
  sendOTP: async (phone: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const otp = generateOTP()
        if (fakeUsers[phone as keyof typeof fakeUsers]) {
          fakeUsers[phone as keyof typeof fakeUsers].otp = otp
          console.log(`OTP for ${phone}: ${otp}`) // In real app, this would be sent via SMS
          resolve(otp)
        } else {
          // Create new user
          fakeUsers[phone as keyof typeof fakeUsers] = { 
            name: `User ${phone.slice(-4)}`, 
            otp 
          }
          console.log(`OTP for new user ${phone}: ${otp}`)
          resolve(otp)
        }
      }, 1000)
    })
  },

  login: async (phone: string, otp: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = fakeUsers[phone as keyof typeof fakeUsers]
        if (userData && userData.otp === otp) {
          const user = {
            phone,
            name: userData.name,
            isAuthenticated: true
          }
          resolve(user)
        } else {
          resolve(null)
        }
      }, 500)
    })
  },

  saveUser: (user: User) => {
    localStorage.setItem('whatsapp_user', JSON.stringify(user))
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const savedUser = localStorage.getItem('whatsapp_user')
    return savedUser ? JSON.parse(savedUser) : null
  },

  clearUser: () => {
    localStorage.removeItem('whatsapp_user')
  }
}
