// backend/src/app.js
import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const server = createServer(app);

// Socket setup
const io = connectToSocket(server);

// PORT from environment or fallback
const PORT = process.env.PORT || 8000;

// FRONTEND URL from environment
const FRONTEND_URL = process.env.FRONTEND_URL || "https://proconnect-x0ok.onrender.com";

// CORS: allow frontend and localhost
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// API routes
app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not set in environment");

    const connectionDb = await mongoose.connect(mongoUri);
    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
