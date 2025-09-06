// frontend/src/environment.js

const IS_PROD = process.env.NODE_ENV === "production";

const server = IS_PROD
  ? process.env.REACT_APP_API_URL || "https://proconnect-x0ok.onrender.com"
  : "http://localhost:8000";

export default server;
