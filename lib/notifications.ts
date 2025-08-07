// Notification management
class NotificationManager {
  private permission: NotificationPermission = 'default'

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
      console.log('🔔 NotificationManager initialized, current permission:', this.permission)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('🔔 Notifications not supported in this browser')
      return false
    }

    if (this.permission === 'granted') {
      console.log('🔔 Notification permission already granted')
      return true
    }

    console.log('🔔 Requesting notification permission...')
    const permission = await Notification.requestPermission()
    this.permission = permission
    console.log('🔔 Notification permission result:', permission)
    return permission === 'granted'
  }

  showNotification(title: string, options: {
    body?: string
    icon?: string
    tag?: string
    data?: any
  } = {}): void {
    if (this.permission !== 'granted') {
      console.log('🔔 Cannot show notification - permission not granted:', this.permission)
      return
    }

    console.log('🔔 Creating notification:', title, options.body)

    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      data: options.data,
      requireInteraction: false,
      silent: false
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle click
    notification.onclick = () => {
      console.log('🔔 Notification clicked')
      window.focus()
      notification.close()
      if (options.data?.callback) {
        options.data.callback()
      }
    }
  }

  showMessageNotification(senderName: string, message: string, senderPhone: string, callback?: () => void): void {
    console.log('🔔 ATTEMPTING TO SHOW MESSAGE NOTIFICATION')
    console.log('  - Sender:', senderName)
    console.log('  - Message:', message)
    console.log('  - Permission:', this.permission)
    console.log('  - Page hidden:', document.hidden)
    
    if (this.permission !== 'granted') {
      console.log('❌ Notification permission not granted:', this.permission)
      return
    }

    // Always show notification for incoming messages, regardless of page visibility
    // This ensures Person B gets notifications when Person A sends a message
    console.log('✅ SHOWING MESSAGE NOTIFICATION')

    const notification = new Notification(`💬 ${senderName}`, {
      body: message,
      icon: '/favicon.ico',
      tag: `message_${senderPhone}`,
      requireInteraction: false,
      silent: false
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle click
    notification.onclick = () => {
      console.log('🔔 Message notification clicked')
      window.focus()
      notification.close()
      if (callback) {
        callback()
      }
    }

    console.log('🔔 Message notification created successfully')
  }
}

export const notificationManager = new NotificationManager()
