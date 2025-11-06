// utils/socket.ts
import { io } from "socket.io-client";

const PROD_URL = "https://lonelynet.onrender.com";
const DEV_URL = "http://192.168.1.12:5000";

const API_URL = process.env.NODE_ENV === "production" ? PROD_URL : DEV_URL;

// ❌ KHÔNG auto connect
export const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

// ✅ Hàm “đánh thức” server trước khi connect
export const connectSocket = async () => {
  try {
    await fetch(API_URL); // Render free server wake-up ping
    socket.connect();
  } catch (err) {
    console.warn("⚠️ Socket connection failed:", err);
  }
};
