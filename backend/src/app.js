// backend/src/app.js
import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";

dotenv.config(); // <-- load environment variables from process.env

const app = express();
const server = createServer(app);

// socket setup (unchanged)
const io = connectToSocket(server);

// PORT from Render or fallback to 8000
const PORT = process.env.PORT || 8000;

// FRONTEND URL(s) — update to your actual rendered frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "https://proconnect-1.onrender.com";

app.set("port", PORT);

// CORS: allow the deployed frontend and localhost (for dev)
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [FRONTEND_URL, "http://localhost:3000"];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed by server"), false);
  },
  credentials: true,
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// your API routes
app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    // Use MONGO_URI from environment
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not set in environment");
    const connectionDb = await mongoose.connect(mongoUri, {
      // options (mongoose v6/v7 don't require these, but safe)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

    server.listen(PORT, () => {
      console.log(`LISTENING ON PORT ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // crash so Render shows an error
  }
};

start();
