export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.12:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.1.12:5000";

export const DEFAULT_MAP_CENTER = {
  latitude: 16.45568,
  longitude: 107.59315,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const API_ENDPOINTS = {
  POSTS: "/posts",
  CHAT_ROOMS: "/chat/rooms",
  MESSAGES: "/chat/messages",
  USERS: "/users",
} as const;