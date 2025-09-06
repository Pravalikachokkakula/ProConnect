// frontend/src/environment.js

// Check if React is running in production
const IS_PROD = process.env.NODE_ENV === "production";

// Backend URL
const server = IS_PROD
  ? process.env.REACT_APP_API_URL || "https://proconnect-x0ok.onrender.com"
  : "http://localhost:8000";

export default server;
