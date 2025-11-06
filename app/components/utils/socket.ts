// utils/socket.ts
import { io } from "socket.io-client";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://192.168.1.12:5000";

export const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
