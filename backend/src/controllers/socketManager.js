import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-call", (path) => {
      if (!connections[path]) connections[path] = [];
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      connections[path].forEach((id) => io.to(id).emit("user-joined", socket.id, connections[path]));

      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
        });
      }
    });

    socket.on("signal", (toId, message) => io.to(toId).emit("signal", socket.id, message));

    socket.on("chat-message", (data, sender) => {
      const [room] = Object.entries(connections).find(([_, v]) => v.includes(socket.id)) || [];
      if (!room) return;

      if (!messages[room]) messages[room] = [];
      messages[room].push({ sender, data, "socket-id-sender": socket.id });

      connections[room].forEach((id) => io.to(id).emit("chat-message", data, sender, socket.id));
    });

    socket.on("disconnect", () => {
      const rooms = Object.entries(connections);
      rooms.forEach(([room, arr]) => {
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
