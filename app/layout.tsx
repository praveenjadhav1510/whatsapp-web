import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { NotificationPermission } from '@/components/notification-permission'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WhatsApp Web Clone',
  description: 'A real-time messaging app with phone authentication and MongoDB storage',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationPermission />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
