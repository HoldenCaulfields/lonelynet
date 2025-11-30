import { API_URL, API_ENDPOINTS } from "@/utils/constants";
import { Room, Message } from "@/types/types";

export const chatAPI = {
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.CHAT_ROOMS}`);
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
  },

  async createRoom(data: { name: string; description?: string }): Promise<Room> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.CHAT_ROOMS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  },

  async getMessages(roomId: string, page = 1, limit = 50) {
    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.MESSAGES}?roomId=${roomId}&page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async sendMessage(roomId: string, content: string): Promise<Message> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, content }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  async joinRoom(roomId: string): Promise<Room> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.CHAT_ROOMS}/${roomId}/join`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to join room");
    return res.json();
  },
};