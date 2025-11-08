// utils/socket.ts
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

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
