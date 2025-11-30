import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/utils/constants";

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return this.socket;
  }

  joinRoom(roomId: string, userId: string) {
    this.socket?.emit("join_room", { roomId, userId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit("leave_room", { roomId });
  }

  sendMessage(roomId: string, message: string, userId: string) {
    this.socket?.emit("send_message", { roomId, message, userId, timestamp: new Date() });
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on("receive_message", callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on("user_joined", callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on("user_left", callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();