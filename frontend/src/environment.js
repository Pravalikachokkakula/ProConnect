// environment.js

// Check if the environment variable NODE_ENV is set to "production"
const IS_PROD = process.env.NODE_ENV === "production";

const server = IS_PROD
  ? "https://proconnect-x0ok.onrender.com" // Production backend
  : "http://localhost:8000";               // Local backend for development

export default server;
