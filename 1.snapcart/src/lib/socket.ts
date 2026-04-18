// ✅ FIX #7: Added typeof window === 'undefined' guard
// socket.io-client uses browser WebSocket APIs. Without this guard,
// importing this file in any server component or API route would crash Next.js.
// Also added reconnection config so dropped connections recover automatically.

import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
  // ✅ FIXED: Guard against server-side execution (SSR / API routes)
  if (typeof window === 'undefined') return null

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER!, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}
