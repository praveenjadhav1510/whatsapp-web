# WhatsApp Web Clone

A full-stack WhatsApp Web-like chat application built using **Next.js**, **Node.js**, **MongoDB Atlas**, and **Socket.IO**, featuring real-time messaging, user login, chat notifications, message read receipts, and mobile-friendly design.

---

## 🚀 Features

- ✅ User Login & Logout
- ✅ WhatsApp-style chat UI (responsive for mobile + desktop)
- ✅ Message bubbles with timestamps
- ✅ Blue ticks (✅✅) for read receipts
- ✅ Unread message count and notification bubbles
- ✅ Real-time messaging with Socket.IO
- ✅ MongoDB-based message storage and status tracking
- ✅ Webhook-style message simulation support

---

## Tech Stack

| Layer     | Stack                               |
| --------- | ----------------------------------- |
| Frontend  | Next.js, Tailwind CSS               |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas                       |
| Real-time | Socket.IO                           |
| Hosting   | Vercel (frontend), Render (backend) |

---

## ⚙️ Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=your-mongodb-connection-uri
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
JWT_SECRET=your-secret-key
```

Encode special characters in your MongoDB password (like `$`, `@`, `#`, etc.) using URL encoding.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/praveenjadhav1510/whatsapp-web.git
cd whatsapp-web

# Install dependencies
pnpm install      # or npm install

# Start the dev server
pnpm dev          # or npm run dev
```

If backend is separate:

```bash
# Navigate to backend folder
cd backend

# Install & run server
pnpm install
pnpm start        # or node server.js
```

## 📡 Live Demo

🔗 [Live Project URL](https://your-vercel-url.vercel.app)

---

## 📄 License

This project is for evaluation and learning purposes.

---

## ✨ Credits

Built with ❤️ by [Praveen Jadhav](https://github.com/praveenjadhav1510)
