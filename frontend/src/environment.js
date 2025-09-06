// environment.js

// Check if React is running in production
const IS_PROD = process.env.NODE_ENV === "production";

// Use the backend URL from environment variable for production, fallback to localhost
const server = IS_PROD
  ? process.env.REACT_APP_API_URL || "https://proconnect-x0ok.onrender.com" // Production backend
  : "http://localhost:8000"; // Local backend

export default server;
