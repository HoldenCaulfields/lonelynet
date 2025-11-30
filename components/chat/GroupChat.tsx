"use client";

import { useEffect, useState, useRef } from "react";
import { useChat as useChatContext } from "@/context/chat";
import { chatAPI } from "@/services/api/chat";
import socketService from "@/services/socket/socket";

interface GroupChatProps {
  visible: boolean;
  onClose: () => void;
}

export default function GroupChat({ visible, onClose }: GroupChatProps) {
  const { currentRoom, messages, setMessages, addMessage } = useChatContext();
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRoom) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await chatAPI.getMessages(currentRoom._id);
        setMessages(data.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    socketService.joinRoom(currentRoom._id, "userId"); // Replace with actual userId
    socketService.onMessage(addMessage);

    return () => {
      socketService.leaveRoom(currentRoom._id);
    };
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !currentRoom) return;

    try {
      const message = await chatAPI.sendMessage(currentRoom._id, messageContent);
      socketService.sendMessage(currentRoom._id, messageContent, "userId");
      addMessage(message);
      setMessageContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!visible || !currentRoom) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">{currentRoom.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg._id} className="bg-gray-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}