"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Room, Message } from "@/types/types";

interface ChatContextType {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  addRoom: (room: Room) => void;
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRoom = useCallback((room: Room) => {
    setRooms(prev => {
      const exists = prev.find(r => r._id === room._id);
      return exists ? prev : [...prev, room];
    });
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoom,
        messages,
        loading,
        error,
        addRoom,
        setCurrentRoom,
        setRooms,
        setMessages,
        addMessage,
        setLoading,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}