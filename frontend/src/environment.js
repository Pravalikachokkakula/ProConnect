const IS_PROD = false;

const server = IS_PROD
  ? "https://apnacollegebackend.onrender.com" // production
  : "http://localhost:8000"; // local backend

export default server;
