// backend/src/controllers/socketManager.js
import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // Only allow your frontend URL (HTTPS) for security
      origin: ["https://proconnect-frontend-3i5q.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // User joins a call
    socket.on("join-call", (roomId) => {
      if (!connections[roomId]) connections[roomId] = [];
      connections[roomId].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Notify everyone in the room
      connections[roomId].forEach((id) =>
        io.to(id).emit("user-joined", socket.id, connections[roomId])
      );

      // Send chat history to new user
      if (messages[roomId]) {
        messages[roomId].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    // WebRTC signaling
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // Chat messages
    socket.on("chat-message", (data, sender) => {
      const [room] = Object.entries(connections).find(([_, v]) =>
        v.includes(socket.id)
      ) || [];
      if (!room) return;

      if (!messages[room]) messages[room] = [];
      messages[room].push({ sender, data, "socket-id-sender": socket.id });

      connections[room].forEach((id) =>
        io.to(id).emit("chat-message", data, sender, socket.id)
      );
    });

    // Disconnect
    socket.on("disconnect", () => {
      Object.entries(connections).forEach(([room, arr]) => {
        const index = arr.indexOf(socket.id);
        if (index !== -1) {
          arr.splice(index, 1);
          arr.forEach((id) => io.to(id).emit("user-left", socket.id));
          if (arr.length === 0) delete connections[room];
        }
      });
      delete timeOnline[socket.id];
    });
  });

  return io;
};
