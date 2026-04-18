// ✅ FIX #5: CORS now accepts array of origins (dev + prod)
// ✅ FIX #8: Error handling added to all socket event axios calls
// (package.json fix is separate — add "start": "node index.js")

import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"

dotenv.config()
const app = express()
app.use(express.json())
const server = http.createServer(app)
const port = process.env.PORT || 5000

const io = new Server(server, {
  cors: {
    // ✅ FIX #5: Support multiple origins — dev + production URL
    origin: [process.env.NEXT_BASE_URL, "http://localhost:3000"].filter(Boolean),
    credentials: true
  }
})

io.on("connection", (socket) => {

  socket.on("identity", async (userId) => {
    try {
      // ✅ FIX #8: try/catch on every axios call — prevents unhandled rejections crashing the server
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, { userId, socketId: socket.id })
    } catch (err) {
      console.error("identity error:", err.message)
    }
  })

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    }
    try {
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, { userId, location })
      io.emit("update-deliveryBoy-location", { userId, location })
    } catch (err) {
      console.error("update-location error:", err.message)
    }
  })

  socket.on("join-room", (roomId) => {
    console.log("join room with", roomId)
    socket.join(roomId)
  })

  socket.on("send-message", async (message) => {
    console.log(message)
    try {
      await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message)
      io.to(message.roomId).emit("send-message", message)
    } catch (err) {
      console.error("send-message error:", err.message)
    }
  })

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })

})

app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body
  if (socketId) {
    io.to(socketId).emit(event, data)
  } else {
    io.emit(event, data)
  }
  return res.status(200).json({ "success": true })
})

server.listen(port, () => {
  console.log("server started at", port)
})
