# 🚀 WhatsApp Web Clone

A full-featured WhatsApp Web clone built with **Next.js 14**, **MongoDB Atlas**, **Socket.IO**, and **Tailwind CSS**.

## ✨ Features

- 📱 **WhatsApp-like UI** - Pixel-perfect recreation of WhatsApp Web interface
- 💬 **Real-time Messaging** - Instant message delivery with Socket.IO
- 🔄 **Message Status** - Sent ✅, Delivered ✅✅, Read ✅✅ (blue) indicators
- ⌨️ **Typing Indicators** - See when someone is typing in real-time
- 📱 **Mobile Responsive** - Works perfectly on all device sizes
- 🗄️ **MongoDB Integration** - Persistent message storage with MongoDB Atlas
- 🔌 **WebSocket Support** - Real-time updates without page refresh
- 📊 **Connection Status** - Visual indicators for database and socket connections
- 🎯 **Optimistic UI** - Messages appear instantly with server sync

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, MongoDB Atlas
- **Real-time**: Socket.IO for WebSocket connections
- **Database**: MongoDB with aggregation pipelines
- **Deployment**: Vercel-ready configuration

## 🚀 Quick Start

### 1. Clone & Install
\`\`\`bash
git clone <your-repo>
cd whatsapp-web-clone
npm install
\`\`\`

### 2. Environment Setup
Create \`.env.local\`:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 4. Setup Database (Optional)
Visit \`http://localhost:3000/setup\` for step-by-step MongoDB Atlas setup guide.

## 📱 How to Use

1. **Start the App** - Visit \`http://localhost:3000\`
2. **View Conversations** - See sample conversations in the sidebar
3. **Send Messages** - Click on a conversation and start typing
4. **Test Real-time** - Open multiple tabs to see real-time messaging
5. **Mobile View** - Resize window to test mobile responsiveness

## 🧪 Testing Real-time Features

### Single Browser Testing:
1. Open multiple tabs of the app
2. Select the same conversation in both tabs
3. Send messages from one tab → see them appear instantly in the other
4. Start typing in one tab → see typing indicator in the other

### Multi-Browser Testing:
1. Open app in different browsers (Chrome, Firefox, Safari)
2. Join the same conversation in both browsers
3. Test all real-time features between browsers

## 📊 Database Schema

### Collection: \`processed_messages\`
\`\`\`javascript
{
_id: ObjectId,
wa_id: String,           // WhatsApp ID (phone number)
text: String,            // Message content
timestamp: String,       // ISO timestamp
type: String,            // 'incoming' | 'outgoing'
status: String,          // 'sent' | 'delivered' | 'read'
sender_name: String,     // Contact name (optional)
meta_msg_id: String,     // WhatsApp message ID (optional)
created_at: Date,
updated_at: Date
}
\`\`\`

## 🔌 API Endpoints

- \`GET /api/conversations\` - Get all conversations
- \`GET /api/messages/[waId]\` - Get messages for a contact
- \`POST /api/messages\` - Send a new message
- \`PUT /api/messages/status\` - Update message status
- \`GET /api/test-db\` - Test database connection
- \`GET /api/socketio\` - WebSocket endpoint

## 🌐 Deployment

### Deploy to Vercel:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
 - \`MONGODB_URI\`
4. Deploy!

### Environment Variables for Production:
\`\`\`env
MONGODB_URI=your-mongodb-atlas-connection-string
\`\`\`

## 🎯 Key Features Explained

### Real-time Messaging
- **Socket.IO Integration**: Instant message delivery
- **Room-based Architecture**: Each conversation has its own room
- **Optimistic Updates**: Messages appear immediately, then sync

### Message Status System
- **Sending**: Shows spinner while processing
- **Sent**: Single gray checkmark ✅
- **Delivered**: Double gray checkmarks ✅✅
- **Read**: Double blue checkmarks ✅✅

### Typing Indicators
- **Live Updates**: See when someone is typing
- **Auto-timeout**: Stops after 1 second of inactivity
- **Multiple Users**: Shows count when multiple people typing

### Mobile Responsiveness
- **Adaptive Layout**: Sidebar hides on mobile when chat is open
- **Touch-friendly**: Optimized for mobile interactions
- **Responsive Design**: Works on all screen sizes

## 🔧 Development Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
npm run setup-db     # Setup database indexes
\`\`\`

## 🐛 Troubleshooting

### MongoDB Connection Issues:
1. Check your connection string format
2. Ensure network access is configured (0.0.0.0/0)
3. Verify username and password are correct
4. Visit \`/setup\` for detailed setup guide

### Socket.IO Issues:
1. Check browser console for connection errors
2. Ensure port 3000 is not blocked
3. Try refreshing the page
4. Running multiple dev servers (e.g., :3000 and :3001)? Point both to the same Socket.IO backend by adding NEXT_PUBLIC_SOCKET_URL=http://localhost:3000 to both apps' .env.local files, then restart. This ensures real-time events are delivered across both sessions instantly.

### General Issues:
1. Clear browser cache
2. Restart development server
3. Check console for error messages

## 📝 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using Next.js, MongoDB, and Socket.IO**
